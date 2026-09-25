import { useId, useState } from 'react'
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight'
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown'
import { IdentificationCard } from '@phosphor-icons/react/dist/csr/IdentificationCard'
import { Receipt } from '@phosphor-icons/react/dist/csr/Receipt'
import { entryDestinations } from '../data/entryRequirements'
import './travel-entry-check.css'

export default function TravelEntryCheck({ title, description }) {
  const fieldId = useId()
  const [destinationId, setDestinationId] = useState('indonesia')
  const destination = entryDestinations.find(item => item.id === destinationId) || entryDestinations[0]

  return (
    <section className="travel-entry" id="entry-requirements" aria-labelledby={`${fieldId}-title`}>
      <div className="travel-entry-heading">
        <span className="tips-script">The little details before departure</span>
        <h2 id={`${fieldId}-title`}>{title || 'Visas & entry fees'}</h2>
        <p>{description || 'Some trips need a visa, travel authorisation, arrival form or visitor levy. Check what applies to your passport, route and travel dates before you fly.'}</p>
      </div>

      <div className="travel-entry-tools">
        <div className="travel-entry-worldwide">
          <IdentificationCard size={39} weight="light" aria-hidden="true" />
          <span className="travel-entry-eyebrow">A worldwide starting point</span>
          <h3>Do I need a visa?</h3>
          <p>IATA Travel Centre connects you with a worldwide passport, visa and health requirements checker. Use it to start your research, then confirm the details with your destination’s immigration authority.</p>
          <a className="travel-entry-cta" href="https://www.iata.org/en/travel-centre/" target="_blank" rel="noopener noreferrer">Open IATA Travel Centre <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
          <p className="travel-entry-preparation">Have your passport nationality, travel dates and any transit stops handy.</p>
          <a className="travel-entry-guidance" href="https://www.smartraveller.gov.au/travel-essentials/getting-foreign-visa" target="_blank" rel="noopener noreferrer">Smartraveller’s visa guidance <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
        </div>

        <div className="travel-entry-destination">
          <label htmlFor={fieldId}>Find your destination’s official links</label>
          <div className="travel-entry-select">
            <select id={fieldId} value={destinationId} onChange={event => setDestinationId(event.target.value)} aria-describedby={`${fieldId}-note`}>
              {entryDestinations.map(item => <option value={item.id} key={item.id}>{item.label}</option>)}
            </select>
            <CaretDown size={18} aria-hidden="true" />
          </div>
          <p className="travel-entry-destination-note" id={`${fieldId}-note`} aria-live="polite">{destination.note}</p>
          <ul className="travel-entry-links" aria-label={`Official entry resources for ${destination.label}`}>
            {destination.links.map(link => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  <span className="travel-entry-resource">
                    <span className="travel-entry-kind">{link.kind}</span>
                    <span className="travel-entry-link-title">{link.title}</span>
                    <span className="travel-entry-link-description">{link.description}</span>
                    <span className="travel-entry-source">{link.source}</span>
                  </span>
                  <ArrowUpRight size={19} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="travel-entry-new-tab">Official links open in a new tab. For other destinations, start with IATA above.</p>
        </div>
      </div>

      <div className="travel-entry-reminder">
        <Receipt size={25} weight="light" aria-hidden="true" />
        <p><strong>A little check before you pay.</strong> A visa, an arrival form and a visitor levy can be separate requirements. Use the official sites to check exemptions, current fees and whether payment is needed before arrival. Save any receipts or QR codes with your travel documents.</p>
      </div>
    </section>
  )
}
