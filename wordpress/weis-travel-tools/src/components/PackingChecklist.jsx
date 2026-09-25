import { useEffect, useId, useState } from 'react'
import { ArrowDown } from '@phosphor-icons/react/dist/csr/ArrowDown'
import { ArrowCounterClockwise } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise'
import { SuitcaseRolling } from '@phosphor-icons/react/dist/csr/SuitcaseRolling'
import './packing-checklist.css'

const STORAGE_KEY = 'weis-tiny-adventures-packing-v1'

const essentials = [
  { id: 'documents', label: 'Travel documents', note: 'Including passport, visas, flight tickets, travel insurance, drivers licence, etc.' },
  { id: 'clothes', label: 'Essential clothes' },
  { id: 'underwear', label: 'Underwear' },
  { id: 'toiletries', label: 'Toiletries' },
  { id: 'phone', label: 'Phone' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'charger', label: 'Chargers & Powerbank' },
  { id: 'adapter', label: 'Plug adapter' },
  { id: 'bottle', label: 'Reusable bottle' },
]

const tripLists = {
  city: {
    label: 'City',
    note: 'For slow mornings and streets worth getting lost in.',
    items: [
      { id: 'city-shoes', label: 'Walking shoes' },
      { id: 'city-layer', label: 'Light layer' },
      { id: 'city-bag', label: 'Everyday bag' },
    ],
  },
  beach: {
    label: 'Beach',
    note: 'For salty hair, sandy toes and a slower kind of day.',
    items: [
      { id: 'beach-swimwear', label: 'Swimwear' },
      { id: 'beach-hat', label: 'Sun protection', note: 'Sunhat and sunscreen.' },
      { id: 'beach-towel', label: 'Quick-dry towel' },
    ],
  },
  outdoors: {
    label: 'Outdoors',
    note: 'For fresh air, winding trails and one more viewpoint.',
    items: [
      { id: 'outdoors-shoes', label: 'Trail shoes' },
      { id: 'outdoors-layer', label: 'Weather layer' },
      { id: 'outdoors-bag', label: 'Daypack' },
    ],
  },
}

const knownItemIds = new Set([
  ...essentials,
  ...Object.values(tripLists).flatMap((trip) => trip.items),
].map((item) => item.id))

function readSavedList() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    return {
      trip: saved && Object.hasOwn(tripLists, saved.trip) ? saved.trip : 'city',
      checked: Array.isArray(saved?.checked)
        ? [...new Set(saved.checked.filter((id) => typeof id === 'string' && knownItemIds.has(id)))]
        : [],
    }
  } catch {
    return { trip: 'city', checked: [] }
  }
}

export default function PackingChecklist({ title, description }) {
  const fieldId = useId()
  const [packing, setPacking] = useState(readSavedList)
  const [savedLocally, setSavedLocally] = useState(true)
  const trip = tripLists[packing.trip]
  const items = [...essentials, ...trip.items]
  const checkedItems = new Set(packing.checked)
  const packedCount = items.filter((item) => checkedItems.has(item.id)).length

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(packing))
      setSavedLocally(true)
    } catch {
      setSavedLocally(false)
    }
  }, [packing])

  function toggleItem(id) {
    setPacking((current) => ({
      ...current,
      checked: current.checked.includes(id)
        ? current.checked.filter((checkedId) => checkedId !== id)
        : [...current.checked, id],
    }))
  }

  function resetList() {
    const visibleIds = new Set(items.map((item) => item.id))
    setPacking((current) => ({
      ...current,
      checked: current.checked.filter((id) => !visibleIds.has(id)),
    }))
  }

  function downloadList() {
    const content = [
      'WEIS TINY ADVENTURES',
      `A little packing list: ${trip.label.toLowerCase()} escape`,
      '',
      ...items.map((item) => `${checkedItems.has(item.id) ? '[x]' : '[ ]'} ${item.label}${item.note ? ` — ${item.note}` : ''}`),
      '',
      `${packedCount} of ${items.length} packed`,
      '',
      'A starting point, with room for your own essentials.',
      'Adapt this list to your destination, weather and plans.',
      '',
      'Less luggage. More freedom.',
    ].join('\r\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `weis-tiny-adventures-${packing.trip}-packing-list.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section className="packing-section" id="packing-list" aria-labelledby={`${fieldId}-heading`}>
      <div className="packing-intro">
        <span className="packing-script">Less luggage. More freedom.</span>
        <h2 id={`${fieldId}-heading`}>{title || 'Pack a little lighter.'}</h2>
        <p>{description || 'A small bag makes room for a big adventure. Start with the essentials, then add a few things for your kind of getaway.'}</p>
        <div className="packing-intro-note">
          <SuitcaseRolling size={48} weight="thin" aria-hidden="true" />
          <span>Take what you need.<br />Leave room for a little wonder.</span>
        </div>
        <p className="packing-fine-print">A starting point for your own list. Adapt it to your destination, weather and plans.</p>
      </div>

      <div className="packing-notebook">
        <div className="packing-list-top">
          <span className="packing-kicker">The carry-on edit</span>
          <span className="packing-count" aria-live="polite" aria-atomic="true">
            <strong>{packedCount}</strong> / {items.length} packed
          </span>
        </div>
        <div className="packing-progress" aria-hidden="true">
          <span style={{ width: `${packedCount / items.length * 100}%` }} />
        </div>

        <div className="packing-trip-types" role="group" aria-label="Choose your type of trip">
          {Object.entries(tripLists).map(([id, type]) => (
            <button
              key={id}
              type="button"
              aria-pressed={packing.trip === id}
              onClick={() => setPacking((current) => ({ ...current, trip: id }))}
            >
              {type.label}
            </button>
          ))}
        </div>
        <p className="packing-trip-note">{trip.note}</p>

        <ul className="packing-items" aria-label={`${trip.label} packing checklist`}>
          {items.map((item, index) => (
            <li key={item.id} className={index >= essentials.length ? 'packing-extra' : undefined}>
              <label className={checkedItems.has(item.id) ? 'is-packed' : undefined}>
                <input
                  type="checkbox"
                  checked={checkedItems.has(item.id)}
                  onChange={() => toggleItem(item.id)}
                />
                <span className="packing-item-copy">
                  <span className="packing-item-name">{item.label}</span>
                  {item.note && <span className="packing-item-note">{item.note}</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>

        <div className="packing-actions">
          <button className="packing-download" type="button" onClick={downloadList}>
            <ArrowDown size={16} aria-hidden="true" /> Download my list
          </button>
          <button className="packing-reset" type="button" onClick={resetList} disabled={packedCount === 0}>
            <ArrowCounterClockwise size={15} aria-hidden="true" /> Reset this list
          </button>
        </div>
        <p className="packing-save-note">
          {savedLocally ? 'Your ticks are saved on this device.' : 'Keep this page open to keep your ticks, or download your list.'}
        </p>
      </div>
    </section>
  )
}
