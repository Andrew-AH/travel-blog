import { useEffect } from 'react'
import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft'
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt'
import { Compass } from '@phosphor-icons/react/dist/csr/Compass'
import { Header, Postmark, WaveFlourish } from '../components/SiteChrome'
import './about-me.css'

export default function AboutMePage() {
  useEffect(() => {
    document.title = 'About Wei | Weis Tiny Adventures'
    const description = document.querySelector('meta[name="description"]')
    const previousDescription = description?.content
    if (description) description.content = 'Meet Wei: a full-time employee and part-time traveller, sharing little adventures that fit around annual leave, everyday life, and a smaller budget.'
    return () => {
      if (description && previousDescription) description.content = previousDescription
    }
  }, [])

  return (
    <div className="about-page">
      <a className="about-skip-link" href="#about-main">Skip to about Wei</a>
      <Header currentPage="about-me" />
      <main id="about-main">
        <div className="about-container">
          <a className="about-back" href="/"><ArrowLeft size={15} aria-hidden="true" /> Back to the journal</a>
          <section className="about-intro" aria-labelledby="about-title">
            <div className="about-intro-copy">
              <p className="about-kicker"><PaperPlaneTilt size={18} weight="light" aria-hidden="true" /> The person behind the little adventures</p>
              <h1 id="about-title">Hey, I’m Wei.</h1>
              <p className="about-lead">A full-time employee and part-time traveller, exploring the world one annual leave request at a time.</p>
              <WaveFlourish />
              <div className="about-story">
                <p>I love a getaway, but most days I’m dreaming about the next one while getting on with everyday life.</p>
                <p>When I’m not travelling, you’ll usually find me reading manga, making something crafty (almost anything counts), or planning a trip. Apparently, travelling and thinking about travelling need separate spots on my hobby list.</p>
              </div>
            </div>
            <div className="about-postcard-wrap">
              <figure className="about-postcard">
                <div className="about-postcard-image"><img src="/images/alpine-hero-v1.webp" alt="Watercolor-style snowy mountain peaks above a turquoise lake and evergreen trees" width="1278" height="1230" fetchPriority="high" /></div>
                <figcaption>Big daydreams. Little adventures.</figcaption>
              </figure>
              <Postmark />
              <p className="about-postcard-note">Somewhere between the day job<br />and the next departure.</p>
            </div>
          </section>
        </div>

        <section className="about-purpose" aria-labelledby="about-purpose-title">
          <div className="about-container about-purpose-inner">
            <div className="about-purpose-heading">
              <span className="about-script">Why I’m here</span>
              <h2 id="about-purpose-title">A little annual leave can take you a long way.</h2>
              <WaveFlourish />
              <Compass className="about-purpose-compass" size={80} weight="thin" aria-hidden="true" />
            </div>
            <div className="about-purpose-copy">
              <p>I know plenty of people who haven’t ventured beyond the state they grew up in. Sometimes it’s the cost, sometimes it’s finding the time. When holidays have to fit around work, a budget, and everything else life throws at you, getting away can feel like a big ask.</p>
              <p>That’s why I’m putting these guides together. I hope they make your next adventure feel a little more possible. You don’t need months off or a mountain of money to find somewhere magical, just a trip that works for you.</p>
              <p>Whether you’re looking close to home or a little further afield, there’s so much out there to explore. Let’s see how far a little annual leave can take us.</p>
              <p className="about-signoff"><span>See you somewhere lovely,</span><span>Wei</span></p>
            </div>
          </div>
        </section>

        <section className="about-next about-container" aria-labelledby="about-next-title">
          <div><span className="about-script">A little inspiration for your next escape</span><h2 id="about-next-title">Let’s find your next adventure.</h2></div>
          <div className="about-actions">
            <a className="about-primary" href="/destinations">Explore destinations <ArrowRight size={17} aria-hidden="true" /></a>
            <a className="about-secondary" href="/travel-tips">Pick up a few travel tips <ArrowRight size={17} aria-hidden="true" /></a>
          </div>
        </section>
      </main>
      <footer className="about-footer about-container"><span>Small trips. Lasting memories.</span><a href="/">Back to the journal <ArrowRight size={16} aria-hidden="true" /></a></footer>
    </div>
  )
}
