import { useEffect } from 'react'
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { Header, Postmark, WaveFlourish } from '../components/SiteChrome'
import NewsletterSignupForm from '../components/NewsletterSignupForm'
import './subscribe.css'

export default function SubscribePage() {
  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector('meta[name="description"]')
    const previousDescription = description?.content
    document.title = 'Letters from Wei | Weis Tiny Adventures'
    if (description) description.content = 'Join Letters from Wei for travel stories, practical tips, and affordable adventures that fit around annual leave and everyday life.'
    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) description.content = previousDescription
    }
  }, [])

  return (
    <div className="subscribe-page">
      <a className="subscribe-skip-link" href="#subscribe-main">Skip to newsletter signup</a>
      <Header currentPage="subscribe" />
      <main id="subscribe-main" className="subscribe-main">
        <div className="subscribe-container subscribe-layout">
          <section className="subscribe-intro" aria-labelledby="subscribe-title">
            <p className="subscribe-script">Letters from Wei</p>
            <h1 id="subscribe-title">A little wanderlust,<br />delivered.</h1>
            <WaveFlourish />
            <p className="subscribe-invitation">Travel stories, useful tips, and affordable escapes for making the most of your annual leave. From my adventures to yours.</p>
          </section>

          <section className="subscribe-form-panel" aria-labelledby="subscribe-form-title">
            <h2 id="subscribe-form-title">Come along for the adventure.</h2>
            <p className="subscribe-form-intro">A little inspiration for your next escape.</p>
            <NewsletterSignupForm />
            <details className="subscribe-privacy">
              <summary>A note on your details</summary>
              <p>Your email address is used to send Letters from Wei. If you share your first name, it helps personalise the newsletter. Signing up means you agree to receive these emails.</p>
            </details>
          </section>

          <section className="subscribe-letter-details" aria-label="A postcard from Wei">
            <div className="subscribe-postcard-wrap">
              <figure className="subscribe-postcard">
                <div className="subscribe-postcard-image">
                  <img src="/images/alpine-hero-v1.webp" alt="Watercolour mountains rising above a turquoise alpine lake" width="1278" height="1230" />
                </div>
                <figcaption>See you out there, <span>Wei</span></figcaption>
              </figure>
              <Postmark />
            </div>
          </section>
        </div>
      </main>
      <footer className="subscribe-footer subscribe-container">
        <span>Small trips. Lasting memories.</span>
        <a href="/">Back to the journal <ArrowRight size={16} aria-hidden="true" /></a>
      </footer>
    </div>
  )
}
