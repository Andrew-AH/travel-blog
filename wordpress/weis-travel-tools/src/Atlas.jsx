import { useId, useMemo, useRef, useState } from 'react'
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { Compass } from '@phosphor-icons/react/dist/csr/Compass'
import { GlobeHemisphereEast } from '@phosphor-icons/react/dist/csr/GlobeHemisphereEast'
import { MapPin } from '@phosphor-icons/react/dist/csr/MapPin'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt'
import { X } from '@phosphor-icons/react/dist/csr/X'
import WorldMap from './components/WorldMap'
import './destinations.css'

const regions = ['All places', 'Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America']
function DestinationPhoto({ place, ...props }) {
  return place.image ? <img src={place.image} alt={place.imageAlt || ''} width="800" height="600" {...props} /> : <div className="wei-photo-placeholder"><MapPin size={50} weight="thin" aria-hidden="true" /></div>
}
function SelectedPostcard({ place, emptyContinent }) {
  if (!place) return <aside className="selected-postcard postcard-empty"><Compass size={48} weight="thin" aria-hidden="true" /><h2>{emptyContinent ? 'Still on the wish list' : 'A little off the map'}</h2><p>{emptyContinent ? `No pins in ${emptyContinent} just yet. There’s a whole lot of exploring still to do.` : 'Try another place or region to find your next little adventure.'}</p></aside>
  return <aside className="selected-postcard" aria-label="Selected destination">
    <div className="postcard-photo-wrap"><DestinationPhoto place={place} /></div>
    <div className="selected-postcard-copy" key={place.id}>
      <p className="atlas-kicker"><MapPin size={12} weight="fill" aria-hidden="true" /> {place.name === place.country ? place.region : place.country}</p>
      <h2>{place.name}</h2><p className="selected-description">{place.description}</p>
      <a className="postcard-link" href={place.href}>{place.country ? `View all ${place.country} blogs` : 'Explore this destination'} <ArrowRight size={17} aria-hidden="true" /></a>
    </div>
    <div className="postcard-signoff" aria-hidden="true"><span>Wish you were here</span><PaperPlaneTilt size={25} weight="thin" /></div>
  </aside>
}
export default function Atlas({ destinations = [], title, description }) {
  const id = useId()
  const [region, setRegion] = useState('All places')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(destinations[0]?.id ?? null)
  const searchRef = useRef(null)
  const filteredPlaces = useMemo(() => destinations.filter(place => (region === 'All places' || place.region === region) && `${place.name} ${place.country} ${place.region}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [destinations, query, region])
  const mapPlaces = useMemo(() => filteredPlaces.filter(place => Array.isArray(place.coordinates)), [filteredPlaces])
  const selectedPlace = filteredPlaces.find(place => place.id === selectedId) ?? filteredPlaces[0] ?? null
  const emptyContinent = region !== 'All places' && !destinations.some(place => place.region === region) ? region : null
  const countryCount = new Set(destinations.map(place => place.country).filter(Boolean)).size
  const continentCount = new Set(destinations.map(place => place.region).filter(Boolean)).size
  function resetFilters() { setRegion('All places'); setQuery('') }
  return <div className="atlas-page wei-destination-atlas">
    <section className="atlas-explorer" aria-label="Explore destinations">
      <div className="atlas-toolbar">
        <div className="atlas-region-filters" role="group" aria-label="Filter destinations by region">{regions.map(item => <button type="button" key={item} className={region === item ? 'is-active' : ''} aria-pressed={region === item} onClick={() => setRegion(item)}>{item === 'All places' && <GlobeHemisphereEast size={17} aria-hidden="true" />}{item}</button>)}</div>
        <div className="atlas-search"><MagnifyingGlass size={18} aria-hidden="true" /><label className="sr-only" htmlFor={`${id}-search`}>Search destinations</label><input ref={searchRef} id={`${id}-search`} type="search" placeholder="Find a little adventure…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); searchRef.current?.focus() }}><X size={16} /></button>}</div>
      </div>
      <div className="atlas-board"><div className="atlas-map-area">
        <div className="atlas-map-heading"><Compass size={21} weight="light" aria-hidden="true" /><span>The adventure atlas</span></div>
        <WorldMap places={mapPlaces} selectedId={selectedPlace?.id} onSelect={setSelectedId} activeRegion={region} />
        <div className="atlas-map-legend"><span className="atlas-pin-key"><MapPin size={15} weight="fill" aria-hidden="true" />Places in the journal</span><span>Choose a pin. Find a story.</span></div>
      </div><SelectedPostcard place={selectedPlace} emptyContinent={emptyContinent} /></div>
      <div className="atlas-below-map"><p className="atlas-collection-note">{description || 'A growing collection of places, people, and little moments.'}</p><p className="atlas-counts"><span><strong>{destinations.length}</strong> places</span><span><strong>{countryCount}</strong> countries</span><span><strong>{continentCount}</strong> continents</span></p></div>
    </section>
    <section className="atlas-journal" aria-labelledby={`${id}-postcards`}>
      <div className="atlas-journal-heading"><div><span className="atlas-script">A few postcards along the way</span><h2 id={`${id}-postcards`}>{title || 'Little places, lovely stories'}</h2></div><p role="status" aria-live="polite">{filteredPlaces.length === destinations.length ? `${destinations.length} places to get a little lost` : `${filteredPlaces.length} ${filteredPlaces.length === 1 ? 'place' : 'places'} to explore`}</p></div>
      {filteredPlaces.length ? <div className="atlas-destination-grid">{filteredPlaces.map(place => <article className="atlas-destination-card" key={place.id}>
        <a className="destination-photo-button" href={place.href} aria-label={`Explore ${place.name}`}><DestinationPhoto place={place} loading="lazy" decoding="async" /></a>
        <div className="destination-card-copy"><p className="atlas-kicker">{place.country}<span>{place.region}</span></p><h3><a href={place.href}>{place.name}<ArrowRight size={22} weight="light" aria-hidden="true" /></a></h3><p>{place.tagline}</p></div>
      </article>)}</div> : <div className="atlas-no-results"><Compass size={48} weight="thin" aria-hidden="true" /><h3>{emptyContinent ? `No postcards from ${emptyContinent} just yet` : 'No postcards here just yet'}</h3><p>{emptyContinent ? 'More adventures to come. For now, explore the places I’ve been.' : 'Try a different name, country, or region.'}</p><button className="atlas-button" type="button" onClick={resetFilters}>Show all places <ArrowRight size={17} /></button></div>}
    </section>
  </div>
}
