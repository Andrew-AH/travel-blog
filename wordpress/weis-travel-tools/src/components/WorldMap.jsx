import { useEffect, useMemo, useRef, useState } from 'react'
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import { Compass } from '@phosphor-icons/react/dist/csr/Compass'
import { MapPin } from '@phosphor-icons/react/dist/csr/MapPin'
import { Minus } from '@phosphor-icons/react/dist/csr/Minus'
import { Plus } from '@phosphor-icons/react/dist/csr/Plus'
import { ArrowsOutSimple } from '@phosphor-icons/react/dist/csr/ArrowsOutSimple'
import { X } from '@phosphor-icons/react/dist/csr/X'
import worldTopology from '../data/world-countries-110m.json'
import './world-map.css'

// Natural Earth geography, redistributed by world-atlas. Both geometry and
// pins use this projection; no remote tiles or map service are required.
const WIDTH = 1000
const HEIGHT = 510
const MAX_ZOOM = 8
const countries = feature(worldTopology, worldTopology.objects.countries).features
  .filter((country) => country.properties.name !== 'Antarctica')
const projection = geoNaturalEarth1().fitExtent(
  [[25, 22], [975, 481]],
  { type: 'FeatureCollection', features: countries },
)
const path = geoPath(projection)
const geography = countries.map((country) => ({
  id: country.id,
  name: country.properties.name,
  d: path(country),
}))
const graticule = path(geoGraticule10())
const captions = [
  { name: 'North America', coordinates: [-108, 45], kind: 'land' },
  { name: 'South America', coordinates: [-66, -16], kind: 'land' },
  { name: 'Europe', coordinates: [24, 57], kind: 'land' },
  { name: 'Africa', coordinates: [19, 8], kind: 'land' },
  { name: 'Asia', coordinates: [90, 43], kind: 'land' },
  { name: 'Oceania', coordinates: [138, -24], kind: 'land' },
  { name: 'Pacific Ocean', coordinates: [-136, -10], kind: 'ocean' },
  { name: 'Atlantic Ocean', coordinates: [-33, 15], kind: 'ocean' },
  { name: 'Indian Ocean', coordinates: [77, -23], kind: 'ocean' },
]
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value))

export default function WorldMap({ places, selectedId, onSelect, activeRegion = 'All places', focusRequest = 0 }) {
  const viewportRef = useRef(null)
  const sceneRef = useRef(null)
  const positionerRef = useRef(null)
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 })
  const dragRef = useRef(null)
  const nearbyRef = useRef(null)
  const previousSelectionRef = useRef({ selectedId, activeRegion, focusRequest })
  const [zoomLevel, setZoomLevel] = useState(1)
  const [nearbyPins, setNearbyPins] = useState(null)
  const visiblePlaces = useMemo(() => places.filter((place) => (
    activeRegion === 'All places' || activeRegion === 'All' || place.region === activeRegion
  )), [places, activeRegion])
  const pins = useMemo(() => visiblePlaces.map((place) => ({
    ...place,
    point: projection(place.coordinates),
  })), [visiblePlaces])
  const visitedCountries = new Set(visiblePlaces.map((place) => place.country))
  const selectedPlace = visiblePlaces.find((place) => place.id === selectedId)

  function paintCamera(nextCamera) {
    const viewport = viewportRef.current
    const positioner = positionerRef.current
    const scene = sceneRef.current
    if (!viewport || !positioner || !scene) return
    const zoom = clamp(nextCamera.zoom, 1, MAX_ZOOM)
    const maxX = Math.max(0, (positioner.offsetWidth * zoom - viewport.clientWidth) / 2 + 24)
    const maxY = Math.max(0, (positioner.offsetHeight * zoom - viewport.clientHeight) / 2 + 24)
    const x = zoom === 1 ? 0 : clamp(nextCamera.x, -maxX, maxX)
    const y = zoom === 1 ? 0 : clamp(nextCamera.y, -maxY, maxY)
    cameraRef.current = { x, y, zoom }
    scene.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`
    scene.style.setProperty('--atlas-pin-scale', 1 / zoom)
    viewport.dataset.zoomed = String(zoom > 1)
  }

  function changeZoom(direction) {
    const camera = cameraRef.current
    const zoom = clamp(camera.zoom + direction * 0.5, 1, MAX_ZOOM)
    const ratio = zoom / camera.zoom
    paintCamera({ x: camera.x * ratio, y: camera.y * ratio, zoom })
    setZoomLevel(zoom)
    setNearbyPins(null)
  }

  function resetView() {
    paintCamera({ x: 0, y: 0, zoom: 1 })
    setZoomLevel(1)
    setNearbyPins(null)
  }

  function focusPlace(point, zoom) {
    const positioner = positionerRef.current
    if (!positioner) return
    paintCamera({
      x: (0.5 - point[0] / WIDTH) * positioner.offsetWidth * zoom,
      y: (0.5 - point[1] / HEIGHT) * positioner.offsetHeight * zoom,
      zoom,
    })
    setZoomLevel(zoom)
  }

  function keepPinVisible(point) {
    const positioner = positionerRef.current
    const viewport = viewportRef.current
    if (!positioner || !viewport) return
    const { x, y, zoom } = cameraRef.current
    const screenX = viewport.clientWidth / 2 + x + (point[0] / WIDTH - 0.5) * positioner.offsetWidth * zoom
    const screenY = viewport.clientHeight / 2 + y + (point[1] / HEIGHT - 0.5) * positioner.offsetHeight * zoom
    if (screenX < 50 || screenX > viewport.clientWidth - 50 || screenY < 60 || screenY > viewport.clientHeight - 45) {
      focusPlace(point, zoom)
    }
  }

  function selectPin(place) {
    setNearbyPins(null)
    focusPlace(place.point, Math.max(cameraRef.current.zoom, 4))
    onSelect(place.id)
    if (nearbyPins) viewportRef.current?.querySelector(`[data-place-id="${place.id}"]`)?.focus({ preventScroll: true })
  }

  function openPin(event, place) {
    const positioner = positionerRef.current
    const scale = positioner.offsetWidth / WIDTH * cameraRef.current.zoom
    // Find overlaps before zooming so covered pins remain reachable on touchscreens.
    const nearby = pins.filter(pin => (
      Math.abs(pin.point[0] - place.point[0]) * scale < 38 &&
      Math.abs(pin.point[1] - place.point[1]) * scale < 42
    ))
    // Every activation selects its postcard immediately; nearby choices are optional.
    selectPin(place)
    if (event.detail !== 0 && nearby.length > 1) {
      setNearbyPins({ anchorId: place.id, places: nearby })
    }
  }

  function closeNearby() {
    const anchorId = nearbyPins?.anchorId
    setNearbyPins(null)
    viewportRef.current?.querySelector(`[data-place-id="${anchorId}"]`)?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (nearbyPins) nearbyRef.current?.querySelector(`[data-nearby-place="${nearbyPins.anchorId}"]`)?.focus({ preventScroll: true })
  }, [nearbyPins])

  useEffect(() => {
    const viewport = viewportRef.current
    const positioner = positionerRef.current
    const resize = () => {
      positioner.style.width = `${Math.min(viewport.clientWidth, viewport.clientHeight * WIDTH / HEIGHT)}px`
      paintCamera(cameraRef.current)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setNearbyPins(null)
    if (pins.length === 1) {
      focusPlace(pins[0].point, 4)
      return
    }
    if (activeRegion === 'All places' || activeRegion === 'All' || pins.length === 0) {
      resetView()
      return
    }
    const xs = pins.map((pin) => pin.point[0])
    const ys = pins.map((pin) => pin.point[1])
    const center = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]
    const viewport = viewportRef.current
    const scale = positionerRef.current.offsetWidth / WIDTH
    const regionZoom = clamp(Math.min(
      (viewport.clientWidth - 100) / ((Math.max(...xs) - Math.min(...xs)) * scale + 30),
      (viewport.clientHeight - 130) / ((Math.max(...ys) - Math.min(...ys)) * scale + 30),
    ), 1.35, MAX_ZOOM)
    focusPlace(center, regionZoom)
    // Region fitting uses the available viewport, including narrow touchscreens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRegion, pins])

  useEffect(() => {
    const previous = previousSelectionRef.current
    previousSelectionRef.current = { selectedId, activeRegion, focusRequest }
    const requestedFocus = previous.focusRequest !== focusRequest
    if (!requestedFocus && (previous.selectedId === selectedId || previous.activeRegion !== activeRegion)) return
    const pin = pins.find((place) => place.id === selectedId)
    if (!pin) return
    focusPlace(pin.point, Math.max(cameraRef.current.zoom, 4))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, activeRegion, pins, focusRequest])

  function startDrag(event) {
    if (!event.target.closest('button, a, .atlas-map-nearby')) setNearbyPins(null)
    if (cameraRef.current.zoom === 1 || event.target.closest('button, a') || event.button !== 0) return
    const camera = cameraRef.current
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: camera.x, y: camera.y }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.dataset.dragging = 'true'
  }

  function moveDrag(event) {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return
    paintCamera({
      ...cameraRef.current,
      x: drag.x + event.clientX - drag.startX,
      y: drag.y + event.clientY - drag.startY,
    })
  }

  function stopDrag(event) {
    if (!dragRef.current) return
    dragRef.current = null
    event.currentTarget.dataset.dragging = 'false'
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function handleKeyboard(event) {
    if (event.key === 'Escape' && nearbyPins) {
      event.preventDefault()
      closeNearby()
      return
    }
    if (event.target !== event.currentTarget) return
    const delta = { ArrowLeft: [65, 0], ArrowRight: [-65, 0], ArrowUp: [0, 65], ArrowDown: [0, -65] }[event.key]
    if (delta && cameraRef.current.zoom > 1) {
      event.preventDefault()
      paintCamera({ ...cameraRef.current, x: cameraRef.current.x + delta[0], y: cameraRef.current.y + delta[1] })
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      changeZoom(1)
    } else if (event.key === '-') {
      event.preventDefault()
      changeZoom(-1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      resetView()
    }
  }

  return (
    <div className="atlas-map" ref={viewportRef} tabIndex={0} role="region"
      aria-label="Interactive destination map. Use plus and minus to zoom, arrow keys to pan when zoomed, and Home to reset."
      onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag}
      onKeyDown={handleKeyboard}>
      <div className="atlas-map-positioner" ref={positionerRef}>
        <div className="atlas-map-scene" ref={sceneRef}>
          <svg className="atlas-map-geography" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true">
            <path className="atlas-map-graticule" d={graticule} />
            <g className="atlas-map-countries">
              {geography.map((country) => (
                <path key={`${country.id}-${country.name}`} d={country.d}
                  className={`${visitedCountries.has(country.name) ? 'atlas-map-country-visited' : ''} ${country.name === selectedPlace?.country ? 'atlas-map-country-selected' : ''}`} />
              ))}
            </g>
            {captions.map((caption) => {
              const point = projection(caption.coordinates)
              return <text key={caption.name} x={point[0]} y={point[1]}
                className={`atlas-map-caption atlas-map-caption-${caption.kind}`} textAnchor="middle">{caption.name}</text>
            })}
          </svg>
          {pins.map((place) => (
            <button key={place.id} type="button"
              className={`atlas-map-pin ${place.id === selectedId ? 'atlas-map-pin-selected' : ''}`}
              style={{ left: `${place.point[0] / WIDTH * 100}%`, top: `${place.point[1] / HEIGHT * 100}%` }}
              data-place-id={place.id}
              aria-label={`Explore ${place.name}${place.name === place.country ? '' : `, ${place.country}`}`} aria-pressed={place.id === selectedId}
              title={`${place.name}${place.name === place.country ? '' : `, ${place.country}`}`} onClick={(event) => openPin(event, place)}
              onFocus={(event) => {
                if (event.currentTarget.matches(':focus-visible')) keepPinVisible(place.point)
              }}>
              <span className="atlas-map-pin-halo" aria-hidden="true" />
              <MapPin weight="fill" aria-hidden="true" />
              <span className={`atlas-map-pin-label ${place.point[0] > WIDTH * .83 ? 'atlas-map-pin-label-east' : ''}`}>{place.name}</span>
            </button>
          ))}
        </div>
      </div>
      {nearbyPins && (
        <div className="atlas-map-nearby" ref={nearbyRef} role="group" aria-label="Choose a nearby destination">
          <div className="atlas-map-nearby-heading"><span>A few nearby adventures</span><button type="button" aria-label="Close nearby destinations" onClick={closeNearby}><X size={16} /></button></div>
          {nearbyPins.places.map(place => <button key={place.id} type="button" data-nearby-place={place.id} className="atlas-map-nearby-place" aria-pressed={place.id === selectedId} onClick={() => selectPin(place)}><MapPin size={17} weight="fill" aria-hidden="true" />{place.name}</button>)}
        </div>
      )}
      <div className="atlas-map-compass" aria-hidden="true"><span>N</span><Compass weight="thin" /></div>
      <div className="atlas-map-controls" role="group" aria-label="Map zoom controls">
        <button type="button" onClick={() => changeZoom(1)} disabled={zoomLevel >= MAX_ZOOM} aria-label="Zoom in"><Plus weight="regular" /></button>
        <button type="button" onClick={() => changeZoom(-1)} disabled={zoomLevel <= 1} aria-label="Zoom out"><Minus weight="regular" /></button>
        <button type="button" onClick={resetView} aria-label="Reset map view" title="Show the whole world"><ArrowsOutSimple weight="regular" /></button>
      </div>
      <span className="atlas-map-hint">{zoomLevel > 1 ? 'Drag to wander · Tap a pin to explore' : 'A little pin. A whole adventure.'}</span>
      <a className="atlas-map-credit" href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a>
      <span className="atlas-map-sr-only" role="status" aria-live="polite">{selectedPlace ? `${selectedPlace.name} postcard selected. ` : ''}{visiblePlaces.length} destinations shown. Map zoom {Math.round(zoomLevel * 100)} percent.</span>
    </div>
  )
}
