import { useEffect } from 'react'
import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft'
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt'
import { Header, WaveFlourish } from '../components/SiteChrome'
import './budget-guides.css'

export default function BudgetGuidesPage() {
  useEffect(() => {
    document.title = 'Budget Guides | Weis Tiny Adventures'
  }, [])

  return (
    <div className="budget-page">
      <a className="budget-skip-link" href="#budget-content">Skip to content</a>
      <Header currentPage="budget-guides" />
      <main id="budget-content" className="budget-main">
        <a className="budget-back" href="/"><ArrowLeft size={14} aria-hidden="true" /> Back to the journal</a>
        <section className="budget-message" aria-labelledby="budget-title">
          <div className="budget-plane" aria-hidden="true">
            <svg className="budget-flight-path" viewBox="0 0 220 85" fill="none">
              <path d="M4 66c33-34 71 24 109-4s-5-54-23-26 19 45 64 8" />
            </svg>
            <PaperPlaneTilt size={54} weight="thin" />
          </div>
          <p className="budget-eyebrow">More adventures. A little less spending.</p>
          <h1 id="budget-title">Budget guides</h1>
          <p className="budget-script">A little work in progress</p>
          <WaveFlourish />
          <p className="budget-description">This page is a work in progress at the moment. I’m putting together practical guides to help you plan memorable adventures on a smaller budget.</p>
          <p className="budget-invitation">In the meantime, there’s plenty to explore.</p>
          <div className="budget-actions">
            <a className="budget-primary" href="/travel-tips">Explore travel tips <ArrowRight size={16} aria-hidden="true" /></a>
            <a className="budget-secondary" href="/destinations">Browse destinations <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
        </section>
        <footer className="budget-footer">
          <span>Small budgets, beautiful adventures.</span>
          <WaveFlourish />
        </footer>
      </main>
    </div>
  )
}
