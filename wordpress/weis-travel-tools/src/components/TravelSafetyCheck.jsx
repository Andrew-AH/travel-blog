import { useId, useState } from 'react'
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight'
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown'
import { GlobeHemisphereEast } from '@phosphor-icons/react/dist/csr/GlobeHemisphereEast'
import { ShieldCheck } from '@phosphor-icons/react/dist/csr/ShieldCheck'
import './travel-safety-check.css'

// Links point to official advice so changing safety levels are always read at the source.
const countries = [
  { id: 'indonesia', label: 'Indonesia (Bali)', name: 'Indonesia', path: 'asia/indonesia', note: 'Bali is covered by the Indonesia travel advice.' },
  { id: 'france', label: 'France', name: 'France', path: 'europe/france' },
  { id: 'greece', label: 'Greece', name: 'Greece', path: 'europe/greece' },
  { id: 'italy', label: 'Italy', name: 'Italy', path: 'europe/italy' },
  { id: 'japan', label: 'Japan', name: 'Japan', path: 'asia/japan' },
  { id: 'south-korea', label: 'South Korea', name: 'South Korea', path: 'asia/south-korea-republic-korea' },
  { id: 'switzerland', label: 'Switzerland', name: 'Switzerland', path: 'europe/switzerland' },
  { id: 'united-kingdom', label: 'United Kingdom (London)', name: 'the United Kingdom', path: 'europe/united-kingdom', note: 'London is covered by the United Kingdom travel advice.' },
]

const otherAdvice = [
  { name: 'New Zealand', service: 'SafeTravel', href: 'https://www.safetravel.govt.nz/' },
  { name: 'United Kingdom', service: 'FCDO', href: 'https://www.gov.uk/foreign-travel-advice' },
  { name: 'Canada', service: 'Travel.gc.ca', href: 'https://travel.gc.ca/travelling/advisories' },
]

export default function TravelSafetyCheck({ title, description }) {
  const [countryId, setCountryId] = useState('indonesia')
  const fieldId = useId()
  const country = countries.find(item => item.id === countryId) || countries[0]

  return (
    <section className="travel-safety" id="country-safety" aria-labelledby={`${fieldId}-title`}>
      <div className="travel-safety-main">
        <div className="travel-safety-intro">
          <span className="travel-safety-kicker"><ShieldCheck size={20} weight="light" aria-hidden="true" /> A little preparation, a lot of peace of mind</span>
          <h2 id={`${fieldId}-title`}>{title || 'Country safety check'}</h2>
          <p>{description || 'Before the flights and the daydreams, check the advice for where you’re going.'}</p>
          <p>For Australian travellers, Smartraveller brings together official advice on safety, entry requirements, health and local laws.</p>
          <span className="travel-safety-signoff">Wander wisely.</span>
          <GlobeHemisphereEast className="travel-safety-globe" size={224} weight="thin" aria-hidden="true" />
        </div>

        <div className="travel-safety-tool">
          <div className="travel-safety-source"><span className="travel-safety-source-mark" aria-hidden="true">AU</span><div><strong>Smartraveller</strong><span>Australian Government travel advice</span></div><ArrowUpRight size={20} aria-hidden="true" /></div>
          <label htmlFor={fieldId}>Where are you heading?</label>
          <div className="travel-safety-select">
            <select id={fieldId} value={countryId} onChange={event => setCountryId(event.target.value)} aria-describedby={`${fieldId}-note`}>
              {countries.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
            <CaretDown size={18} aria-hidden="true" />
          </div>
          <p className="travel-safety-country-note" id={`${fieldId}-note`} aria-live="polite">{country.note || `Read the latest official travel advice for ${country.name}.`}</p>
          <a className="travel-safety-cta" href={`https://www.smartraveller.gov.au/destinations/${country.path}`} target="_blank" rel="noopener noreferrer" aria-label={`Check travel advice for ${country.name} on Smartraveller (opens in a new tab)`}>Check travel advice <ArrowUpRight size={19} aria-hidden="true" /></a>
          <p className="travel-safety-new-tab">Opens Smartraveller in a new tab</p>
          <p className="travel-safety-reminder">Advice can change. Check before booking and again before you leave.</p>
          <a className="travel-safety-all" href="https://www.smartraveller.gov.au/destinations" target="_blank" rel="noopener noreferrer">Going somewhere else? Browse all countries <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
        </div>
      </div>

      <div className="travel-safety-other">
        <p>Travelling on another passport?<span>Start with your own government’s advice.</span></p>
        <div className="travel-safety-other-links">
          {otherAdvice.map(advice => <a key={advice.name} href={advice.href} target="_blank" rel="noopener noreferrer"><span>{advice.name}<small>{advice.service}</small></span><ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>)}
        </div>
      </div>
    </section>
  )
}
