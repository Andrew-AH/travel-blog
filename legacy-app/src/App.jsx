import { lazy, Suspense } from 'react'
import { Header, Newsletter, WaveFlourish } from './components/SiteChrome'
import { posts as adventures } from './data/posts'
import { AirplaneTilt } from '@phosphor-icons/react/dist/csr/AirplaneTilt'
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { Backpack } from '@phosphor-icons/react/dist/csr/Backpack'
import { Camera } from '@phosphor-icons/react/dist/csr/Camera'
import { Compass } from '@phosphor-icons/react/dist/csr/Compass'
import { Heart } from '@phosphor-icons/react/dist/csr/Heart'
import { MapPinArea } from '@phosphor-icons/react/dist/csr/MapPinArea'

const DestinationsPage = lazy(() => import('./pages/DestinationsPage'))
const CountryJournalPage = lazy(() => import('./pages/CountryJournalPage'))
const TravelTipsPage = lazy(() => import('./pages/TravelTipsPage'))
const BudgetGuidesPage = lazy(() => import('./pages/BudgetGuidesPage'))
const AboutMePage = lazy(() => import('./pages/AboutMePage'))
const SubscribePage = lazy(() => import('./pages/SubscribePage'))
const UnsubscribePage = lazy(() => import('./pages/UnsubscribePage'))

const values = [
  { icon: Backpack, title: 'Budget first', lines: ['Smart tips to travel', 'more for less.'] },
  { icon: Camera, title: 'Real stories', lines: ['Honest guides from', 'real experiences.'] },
  { icon: MapPinArea, title: 'Epic destinations', lines: ['Inspiring places that', 'won’t break the bank.'] },
  { icon: Heart, title: 'Travel mindfully', lines: ['Respect the places', 'you explore.'] },
]

function TravelCrest() {
  return (
    <div className="travel-crest">
      <svg className="crest-lettering" viewBox="0 0 360 110" role="img" aria-label="Affordable travel. Real experiences.">
        <defs>
          <path id="tagline-arc" d="M 22 82 Q 180 -30 338 82" />
        </defs>
        <text>
          <textPath href="#tagline-arc" startOffset="50%" textAnchor="middle">
            AFFORDABLE TRAVEL · REAL EXPERIENCES
          </textPath>
        </text>
      </svg>
      <div className="crest-plane" aria-hidden="true">
        <WaveFlourish />
        <AirplaneTilt weight="thin" />
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <link rel="preload" href="/images/alpine-hero-v1.webp" as="image" fetchPriority="high" />
      <img className="hero-art" src="/images/alpine-hero-v1.webp" alt="" fetchPriority="high" width="1278" height="1230" />
      <Header />
      <div className="hero-content">
        <TravelCrest />
        <h1 id="hero-title">
          <span className="hero-serif">Explore more</span>
          <span className="hero-script">Spend Less</span>
        </h1>
        <div className="heart-divider" aria-hidden="true"><span /><Heart weight="regular" /><span /></div>
        <p className="hero-description">
          Practical tips, honest stories, and budget-friendly<br className="desktop-break" />
          {' '}guides to help you explore the world<br className="desktop-break" />
          {' '}one adventure at a time.
        </p>
        <a className="button explore-button" href="/destinations">
          <Compass weight="light" aria-hidden="true" />
          Start exploring
        </a>
      </div>
      <svg className="hero-wave" viewBox="0 0 1440 150" preserveAspectRatio="none" aria-hidden="true">
        <path className="wave-fill" d="M0 42C100-35 182 88 340 97S487 87 565 112s104-35 172-10 153 14 240-2 195-42 267-75 127-36 196-75V150H0Z" />
        <g className="wave-lines">
          <path d="M-15 70C91-11 151 73 257 84" />
          <path d="M-15 86C77 12 145 94 249 101" />
          <path d="M-15 104C78 32 130 109 225 116" />
          <path d="M-15 125C64 53 132 135 223 131" />
        </g>
      </svg>
    </section>
  )
}

function TravelValues() {
  return (
    <section id="about" className="travel-values" aria-label="A little about how we travel">
      <div className="values-grid">
        {values.map(({ icon: Icon, title, lines }) => (
          <div className="value" key={title}>
            <Icon weight="thin" className="value-icon" aria-hidden="true" />
            <h2>{title}</h2>
            <p>{lines[0]}<br />{lines[1]}</p>
          </div>
        ))}
      </div>
      <WaveFlourish className="values-flourish" />
    </section>
  )
}

function AdventureCard({ adventure }) {
  return (
    <article className="adventure-card" id={adventure.id}>
      <img src={adventure.image} srcSet={`${adventure.imageSmall} 400w, ${adventure.image} 800w`} sizes="(max-width: 639px) 82vw, (max-width: 1199px) 26vw, 310px" alt={adventure.alt} className={adventure.imageClass} loading="lazy" decoding="async" width="800" height="600" />
      <div className="card-content">
        <span className="card-category">{adventure.category}</span>
        <h3>{adventure.title}</h3>
        <a className="read-more" href={adventure.href} style={{ textDecoration: 'none' }} aria-label={`Read more: ${adventure.title}`}>
          Read more <ArrowRight weight="bold" aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}

function RecentAdventures() {
  return (
    <section className="recent-adventures" aria-labelledby="adventures-title">
      <img className="whale-shark" src="/images/whale-shark-v2.webp" alt="" loading="lazy" decoding="async" width="600" height="900" />
      <div className="section-heading">
        <span className="script-eyebrow">From the Blog</span>
        <h2 id="adventures-title">Recent adventures</h2>
        <WaveFlourish />
      </div>
      <div className="adventure-grid">
        {adventures.map(adventure => <AdventureCard adventure={adventure} key={adventure.title} />)}
      </div>
      <details className="article-photo-credits">
        <summary>Photo credits</summary>
        <p>Bali rice terraces: <a href="https://unsplash.com/photos/rice-terraces-in-tegelalang-bali--2WlTWZLnRc">Niklas Weiss</a> / <a href="https://unsplash.com/license">Unsplash License</a>.</p>
        <p>Indomie Mi Goreng: <a href="https://commons.wikimedia.org/wiki/File:Cooking_two_packs_of_Indomie_noodles.jpg">Andy Li</a> / <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a> (cropped).</p>
        <p>Lovina Beach: photograph supplied for this journal.</p>
      </details>
      <Newsletter />
    </section>
  )
}

export default function App() {
  const countryRoute = window.location.pathname.replace(/\/$/, '').match(/^\/destinations\/([^/]+)$/)
  if (countryRoute) {
    return <Suspense fallback={<div className="atlas-loading" role="status">Opening the country journal…</div>}><CountryJournalPage countrySlug={countryRoute[1]} /></Suspense>
  }
  if (window.location.pathname.replace(/\/$/, '') === '/subscribe') {
    return <Suspense fallback={<div className="atlas-loading" role="status">A little letter from Wei…</div>}><SubscribePage /></Suspense>
  }
  if (window.location.pathname.replace(/\/$/, '') === '/unsubscribe') {
    return <Suspense fallback={<div className="atlas-loading" role="status">Opening your mailing preferences…</div>}><UnsubscribePage /></Suspense>
  }
  if (window.location.pathname.replace(/\/$/, '') === '/about-me') {
    return <Suspense fallback={<div className="atlas-loading" role="status">A little introduction…</div>}><AboutMePage /></Suspense>
  }
  if (window.location.pathname.replace(/\/$/, '') === '/budget-guides') {
    return <Suspense fallback={<div role="status">Opening budget guides…</div>}><BudgetGuidesPage /></Suspense>
  }
  if (window.location.pathname.replace(/\/$/, '') === '/travel-tips') {
    return <Suspense fallback={<div className="tips-loading" role="status">Opening the field guide…</div>}><TravelTipsPage /></Suspense>
  }
  if (window.location.pathname.replace(/\/$/, '') === '/destinations') {
    return <><link rel="preload" href="/images/watercolor-wash.webp" as="image" fetchPriority="high" /><Suspense fallback={<div className="atlas-loading" role="status">Opening the atlas…</div>}><DestinationsPage /></Suspense></>
  }
  return (
    <main className="travel-page">
      <Hero />
      <TravelValues />
      <RecentAdventures />
    </main>
  )
}
