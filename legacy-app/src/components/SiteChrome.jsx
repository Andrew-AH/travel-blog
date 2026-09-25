import { useEffect, useRef, useState } from 'react'
import { Anchor } from '@phosphor-icons/react/dist/csr/Anchor'
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt'
import { List } from '@phosphor-icons/react/dist/csr/List'
import { X } from '@phosphor-icons/react/dist/csr/X'
import './brand.css'

export function WaveFlourish({ className = '' }) {
  return (
    <svg className={`wave-flourish ${className}`} viewBox="0 0 110 15" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <path d="M2 8c9 0 9 4 17 4s9-7 18-7 9 6 18 6 9-6 18-6 9 6 18 6 9-3 17-3" />
      <path d="M8 10c8 0 10 3 16 2M42 7c6 0 7 5 14 5M79 7c6 0 9 5 15 5" />
    </svg>
  )
}

export function Brand() {
  return (
    <a className="brand" href="/" aria-label="Weis Tiny Adventures home">
      <img className="brand-emblem" src="/images/brand-mark.svg" alt="" width="94" height="76" />
      <span className="brand-wordmark" aria-hidden="true">
        <span className="brand-title">Weis Tiny</span>
        <span className="brand-tagline">Adventures</span>
      </span>
    </a>
  )
}

export function Header({ currentPage = 'home' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(event) {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header className="site-header">
      <Brand />
      <nav id="main-navigation" className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
        <a href="/destinations" aria-current={currentPage === 'destinations' ? 'page' : undefined}>Destinations</a>
        <a href="/travel-tips" aria-current={currentPage === 'travel-tips' ? 'page' : undefined}>Travel tips</a>
        <a href="/budget-guides" aria-current={currentPage === 'budget-guides' ? 'page' : undefined}>Budget guides</a>
        <a href="/about-me" aria-current={currentPage === 'about-me' ? 'page' : undefined}>About me</a>
      </nav>
      <a className="button subscribe-button" href="/subscribe" aria-current={currentPage === 'subscribe' ? 'page' : undefined}><PaperPlaneTilt weight="fill" aria-hidden="true" /><span>Subscribe</span></a>
      <button ref={menuButton} className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-controls="main-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23} /> : <List size={23} />}</button>
    </header>
  )
}

export function Postmark() {
  return (
    <div className="postmark" aria-hidden="true">
      <svg viewBox="0 0 110 110">
        <defs><path id="stamp-top" d="M 17,58 A 38,38 0 0,1 93,58" /><path id="stamp-bottom" d="M 15,60 A 41,41 0 0,0 95,60" /></defs>
        <circle cx="55" cy="55" r="50" /><circle cx="55" cy="55" r="46" className="stamp-dashed" /><circle cx="55" cy="55" r="32" />
        <text><textPath href="#stamp-top" startOffset="50%" textAnchor="middle">YOUR NEXT ADVENTURE</textPath></text>
        <text><textPath href="#stamp-bottom" startOffset="50%" textAnchor="middle">STARTS HERE</textPath></text>
      </svg>
      <Anchor weight="light" />
    </div>
  )
}

export function Newsletter() {
  function openSignup(event) {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email')
    try { window.sessionStorage.setItem('wei-newsletter-email-draft', String(email).trim()) } catch { /* Readers can enter their email again if storage is unavailable. */ }
    window.location.assign('/subscribe')
  }

  return (
    <footer id="newsletter" className="newsletter" role="contentinfo" aria-label="Join the newsletter">
      <div className="newsletter-plane" aria-hidden="true"><svg viewBox="0 0 240 95"><path d="M0 67C38 17 86 106 127 75s-10-67-27-27 57 58 114-9" /></svg><PaperPlaneTilt weight="thin" /></div>
      <div className="newsletter-copy"><h2>Let’s explore the world</h2><p>New tips, stories, and guides<br />delivered to your inbox.</p></div>
      <form className="newsletter-form" onSubmit={openSignup}><label className="sr-only" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" name="email" type="email" placeholder="Your email address" autoComplete="email" maxLength={254} required /><button className="button journey-button" type="submit">Join the journey</button></form>
      <Postmark />
    </footer>
  )
}
