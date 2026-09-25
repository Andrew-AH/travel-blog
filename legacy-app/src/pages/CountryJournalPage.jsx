import { useEffect } from 'react'
import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft'
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { Compass } from '@phosphor-icons/react/dist/csr/Compass'
import { Header, WaveFlourish } from '../components/SiteChrome'
import { getCountryJournal, getCountryPosts } from '../data/countryJournals'
import './destinations.css'
import './country-journal.css'

function CountryPost({ post }) {
  const published = post.status === 'published'
  return (
    <article className="country-post-card" id={post.id}>
      <img className={post.imageClass} src={post.image} srcSet={`${post.imageSmall} 400w, ${post.image} 800w`} sizes="(max-width: 600px) 90vw, (max-width: 850px) 44vw, 350px" alt={post.alt} width="800" height="600" loading="lazy" decoding="async" />
      <div className="country-post-copy">
        <p className="atlas-kicker">{post.category}</p>
        <h3>{published ? <a href={post.href}>{post.title}</a> : post.title}</h3>
        <p className="country-post-excerpt">{post.excerpt}</p>
        {published
          ? <a className="postcard-link" href={post.href}>Read the story <ArrowRight size={17} aria-hidden="true" /></a>
          : <p className="country-post-status">Coming soon</p>}
      </div>
    </article>
  )
}

export default function CountryJournalPage({ countrySlug }) {
  const country = getCountryJournal(countrySlug)
  const countryPosts = country ? getCountryPosts(country.name) : []
  const hasPublishedPosts = countryPosts.some(post => post.status === 'published')

  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector('meta[name="description"]')
    const previousDescription = description?.content
    document.title = country ? `${country.name} travel blog | Weis Tiny Adventures` : 'Journal not found | Weis Tiny Adventures'
    if (description) description.content = country
      ? `Travel stories, destination guides, and little adventures from ${country.name}, collected in Wei's travel journal.`
      : 'Find your next destination in the Weis Tiny Adventures travel journal.'
    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) description.content = previousDescription
    }
  }, [country])

  useEffect(() => {
    // Homepage previews link straight to their entry, including on lazy-loaded routes.
    const id = window.location.hash.slice(1)
    if (countryPosts.some(post => post.id === id)) document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [countrySlug])

  return (
    <div className="atlas-page country-journal-page">
      <a className="skip-link" href="#country-journal-main">Skip to the country journal</a>
      <Header currentPage="destinations" />
      <main id="country-journal-main" className="country-journal-main">
        <a className="country-journal-back" href="/destinations"><ArrowLeft size={16} aria-hidden="true" /> Back to the destination map</a>
        {country ? <>
          <section className="country-journal-intro" aria-labelledby="country-journal-title">
            <div className="country-journal-heading">
              <span className="country-journal-script">From the journal</span>
              <h1 id="country-journal-title">{country.name}</h1>
              <p>Travel stories and little adventures, all in one place.</p>
              <WaveFlourish />
            </div>
            <figure className="country-journal-cover">
              <img src={country.cover.image} srcSet={`${country.cover.imageSmall} 400w, ${country.cover.image} 800w`} sizes="(max-width: 600px) 230px, 300px" alt={country.cover.imageAlt} width="800" height="600" fetchPriority="high" />
              <figcaption>{country.cover.illustrative ? 'An illustrated glimpse of ' : 'A little of '}{country.cover.name}</figcaption>
            </figure>
          </section>

          {countryPosts.length ? (
            <section className="country-posts" aria-labelledby="country-posts-heading">
              <div className="country-posts-heading">
                <h2 id="country-posts-heading">{hasPublishedPosts ? 'All blog posts' : 'Coming to the journal'}</h2>
                {!hasPublishedPosts && <p>A little preview of the stories on their way.</p>}
              </div>
              <div className="country-post-grid">
                {countryPosts.map(post => <CountryPost key={post.id} post={post} />)}
              </div>
            </section>
          ) : (
            <section className="country-journal-empty" aria-labelledby="country-empty-heading">
              <Compass size={43} weight="thin" aria-hidden="true" />
              <h2 id="country-empty-heading">Stories are on their way.</h2>
              <p>The {country.name} journal is still taking shape. New blog posts will appear here when they’re ready.</p>
              <a className="atlas-button" href="/subscribe">Join the mailing list <ArrowRight size={17} aria-hidden="true" /></a>
            </section>
          )}
        </> : (
          <section className="country-journal-empty country-journal-not-found">
            <Compass size={43} weight="thin" aria-hidden="true" />
            <h1>That journal isn’t here yet.</h1>
            <p>Choose a pin on the destination map to find a country’s stories.</p>
          </section>
        )}
      </main>
      <footer className="country-journal-footer"><span>Small trips. Lasting memories.</span><a href="/">Back to the journal <ArrowRight size={16} aria-hidden="true" /></a></footer>
    </div>
  )
}
