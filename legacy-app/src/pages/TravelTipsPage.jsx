import { useEffect, useState } from 'react'
import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft'
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { ArrowDown } from '@phosphor-icons/react/dist/csr/ArrowDown'
import { Backpack } from '@phosphor-icons/react/dist/csr/Backpack'
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown'
import { Compass } from '@phosphor-icons/react/dist/csr/Compass'
import { GlobeHemisphereEast } from '@phosphor-icons/react/dist/csr/GlobeHemisphereEast'
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt'
import { ShieldCheck } from '@phosphor-icons/react/dist/csr/ShieldCheck'
import { Header, Postmark, WaveFlourish } from '../components/SiteChrome'
import TravelSafetyCheck from '../components/TravelSafetyCheck'
import TravelEntryCheck from '../components/TravelEntryCheck'
import PackingChecklist from '../components/PackingChecklist'
import './travel-tips.css'

const tipCollections = [
  {
    id: 'before-you-go', label: 'Before you go', note: 'Make room for the unexpected.',
    tips: [
      { title: 'Plan the first night. Leave a little space after that.', text: 'Save your accommodation address, check how you’ll get there from the airport or station, and note the check-in time. With the arrival sorted, you can leave a few afternoons open for something you stumble across.', takeaway: 'A settled first night is a lovely way to start.' },
      { title: 'Keep the useful things available offline.', text: 'Download the maps you’ll need and save booking confirmations, transport details, and important contacts somewhere you can reach without mobile data. Keep personal documents protected on your device.', takeaway: 'Try opening your essentials in flight mode before you leave.' },
      { title: 'Check the details before you hit “book”.', text: 'Read the current official advice for your destination, then check entry requirements with the relevant government and your airline. Look at the cancellation terms and what your travel insurance actually covers for your plans.', takeaway: 'Use the country safety check above as your starting point.' },
    ],
  },
  {
    id: 'money-tips', label: 'Spend less', note: 'Spend on the moments you’ll remember.',
    tips: [
      { title: 'Compare the whole journey, not just the ticket.', text: 'A cheaper flight can come with baggage charges, a distant airport, or an overnight stop. Add up the fare, transfers, bags, and any extra accommodation before you choose. Flexing your dates can open up more options too.', takeaway: 'The total cost tells a more useful story than the headline fare.' },
      { title: 'Pick a base you can explore on foot.', text: 'Put the places you’re excited about on a map before booking your stay. Somewhere walkable or close to public transport may leave more of your budget for the trip itself, even if the nightly rate is a little higher.', takeaway: 'Compare the room price and the cost of getting around together.' },
      { title: 'Give your day one thing to look forward to.', text: 'Choose the meal, experience, or outing you really care about, then build a slower day around it. Local markets, neighbourhood walks, public gardens, and a picnic can be just as memorable as a packed list of paid attractions.', takeaway: 'Keep a little room in the budget for a happy discovery.' },
    ],
  },
  {
    id: 'on-the-road', label: 'On the road', note: 'Be curious. Tread lightly.',
    tips: [
      { title: 'Learn the little words that open doors.', text: 'A hello, please, and thank you in the local language go a long way. Save a few phrases offline, follow local etiquette, and ask before taking someone’s photo.', takeaway: 'A little curiosity makes a place feel less unfamiliar.' },
      { title: 'Leave room for a slower morning.', text: 'You don’t have to fill every hour. Give yourself time to walk down an interesting street, linger over breakfast, or head back early when you need a rest. Your itinerary can be an invitation rather than a checklist.', takeaway: 'An unplanned hour is still part of the adventure.' },
      { title: 'Take the memory. Leave the place lovely.', text: 'Use marked paths, give wildlife space, and follow the signs at beaches, parks, and cultural sites. Bring a reusable bottle where refills are suitable and take your rubbish with you.', takeaway: 'A good guest leaves room for the next person to enjoy it too.' },
    ],
  },
]

function LittleFieldGuide() {
  const [activeId, setActiveId] = useState(() => window.location.hash === '#money-tips' ? 'money-tips' : 'before-you-go')
  const collection = tipCollections.find(item => item.id === activeId)

  useEffect(() => {
    function onHashChange() {
      if (window.location.hash === '#money-tips') setActiveId('money-tips')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <section className="tips-field-guide tips-container" id="travel-field-guide" aria-labelledby="field-guide-heading">
      <div className="tips-guide-intro">
        <span className="tips-script">Notes for the journey</span>
        <h2 id="field-guide-heading">Small things.<br />Smoother travels.</h2>
        <p>A few practical habits for the planning, the pennies, and everything along the way.</p>
        <div className="tips-topic-buttons" role="group" aria-label="Choose a travel tips topic">
          {tipCollections.map((topic, index) => <button id={topic.id === 'money-tips' ? 'money-tips' : undefined} key={topic.id} type="button" aria-pressed={activeId === topic.id} onClick={() => setActiveId(topic.id)}><span aria-hidden="true">0{index + 1}</span>{topic.label}<ArrowRight size={18} aria-hidden="true" /></button>)}
        </div>
      </div>
      <div className="tips-notebook" key={collection.id}>
        <p className="tips-notebook-caption"><span className="tips-kicker">The little field guide</span><span>0{tipCollections.indexOf(collection) + 1} / 03</span></p>
        {collection.tips.map((tip, index) => <details className="tips-note" key={tip.title} open={index === 0 ? true : undefined}>
          <summary><span className="tips-note-number" aria-hidden="true">0{index + 1}</span><h3>{tip.title}</h3><CaretDown size={18} aria-hidden="true" /></summary>
          <div className="tips-note-copy"><p>{tip.text}</p><p className="tips-takeaway"><Compass size={17} weight="light" aria-hidden="true" />{tip.takeaway}</p></div>
        </details>)}
        <p className="tips-notebook-signoff">{collection.note}<WaveFlourish /></p>
      </div>
    </section>
  )
}

export default function TravelTipsPage() {
  useEffect(() => {
    document.title = 'Travel Tips | Weis Tiny Adventures'
    const description = document.querySelector('meta[name="description"]')
    const previousDescription = description?.content
    if (description) description.content = 'A little preparation for your next adventure: practical travel tips, official safety advice, visa and visitor-levy resources, and a packing checklist that remembers the essentials.'
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(window.location.hash.slice(1))
      target?.scrollIntoView({ block: 'start' })
    })
    return () => {
      cancelAnimationFrame(frame)
      if (description && previousDescription) description.content = previousDescription
    }
  }, [])

  return (
    <div className="tips-page">
      <a className="tips-skip-link" href="#tips-main">Skip to travel tips</a>
      <Header currentPage="travel-tips" />
      <main id="tips-main">
        <section className="tips-hero tips-container" aria-labelledby="tips-title">
          <div className="tips-hero-copy">
            <a href="/" className="tips-back"><ArrowLeft size={15} aria-hidden="true" /> Back to the journal</a>
            <p className="tips-kicker"><PaperPlaneTilt size={17} weight="light" aria-hidden="true" /> A little know-how for the way</p>
            <h1 id="tips-title">Little tips.<br />Bigger adventures.</h1>
            <span className="tips-hero-script">Go a little more prepared.</span>
            <p className="tips-hero-description">Pack lighter, plan smarter, and leave a little room for getting wonderfully lost. The useful bits, all in one place.</p>
            <a className="tips-primary-button" href="#country-safety"><ShieldCheck size={20} weight="light" aria-hidden="true" /> Check your destination <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
          <div className="tips-hero-art">
            <figure className="tips-photo">
              <img src="/images/blog-hammock-v2.webp" alt="A hammock between palms beside a turquoise sea" width="800" height="600" fetchPriority="high" />
              <figcaption>A little planning. A lot of possibility.</figcaption>
            </figure>
            <div className="tips-compass-stamp" aria-hidden="true"><span>GO CURIOUS</span><Compass size={48} weight="thin" /><span>TRAVEL MINDFULLY</span></div>
            <span className="tips-photo-note" aria-hidden="true">For the good part of getting away.</span>
          </div>
        </section>

        <nav className="tips-chapters tips-container" aria-label="In this field guide">
          <span className="tips-kicker">A few things for your carry-on</span>
          <a href="#country-safety"><ShieldCheck size={23} weight="light" aria-hidden="true" /><span><small>01 · BEFORE YOU BOOK</small>Know before you go</span><ArrowRight size={17} aria-hidden="true" /></a>
          <a href="#travel-field-guide"><GlobeHemisphereEast size={23} weight="light" aria-hidden="true" /><span><small>02 · ALONG THE WAY</small>Make the most of it</span><ArrowRight size={17} aria-hidden="true" /></a>
          <a href="#packing-list"><Backpack size={23} weight="light" aria-hidden="true" /><span><small>03 · THE ESSENTIALS</small>Pack a little lighter</span><ArrowRight size={17} aria-hidden="true" /></a>
        </nav>

        <div className="tips-safety-wrap tips-container"><TravelSafetyCheck /><TravelEntryCheck /></div>
        <LittleFieldGuide />
        <div className="tips-packing-wrap tips-container"><PackingChecklist /></div>

        <section className="tips-next-stop" aria-labelledby="tips-next-heading">
          <div className="tips-container tips-next-inner">
            <img src="/images/destinations/greece-400.webp" alt="Whitewashed buildings and blue domes in Greece" width="400" height="300" loading="lazy" decoding="async" />
            <div><span className="tips-script">Now for the lovely part</span><h2 id="tips-next-heading">Where will you wander next?</h2><p>A few places to put all that preparation to good use.</p><a className="tips-text-link" href="/destinations">Open the adventure atlas <ArrowRight size={19} aria-hidden="true" /></a></div>
            <Postmark />
          </div>
        </section>
      </main>
      <footer className="tips-footer tips-container"><span>Little adventures. Lasting memories.</span><a href="/">Back to the journal <ArrowRight size={16} aria-hidden="true" /></a></footer>
    </div>
  )
}
