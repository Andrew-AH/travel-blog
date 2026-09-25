import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft'
import { EnvelopeOpen } from '@phosphor-icons/react/dist/csr/EnvelopeOpen'
import { Header, WaveFlourish } from '../components/SiteChrome'
import './subscribe.css'
import './unsubscribe.css'

export default function UnsubscribePage() {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') || '')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const headingRef = useRef(null)
  const requestRef = useRef(null)
  const inFlight = useRef(false)
  const validLink = /^[A-Za-z0-9_-]{32,128}$/.test(token)

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Mailing preferences | Wei’s Tiny Adventures'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.append(robots)
    return () => { document.title = previousTitle; robots.remove(); requestRef.current?.abort() }
  }, [])

  useEffect(() => {
    if (status === 'success') headingRef.current?.focus()
  }, [status])

  async function unsubscribe() {
    if (!validLink || inFlight.current) return
    inFlight.current = true
    setStatus('submitting')
    setError('')
    const controller = new AbortController()
    requestRef.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ token }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.ok !== true) {
        setStatus('idle')
        setError(result?.error || 'We couldn’t update your preference. Please try again in a moment.')
        return
      }
      setStatus('success')
    } catch {
      setStatus('idle')
      setError('We couldn’t confirm that you’ve unsubscribed. Check your connection and try again.')
    } finally {
      window.clearTimeout(timeout)
      requestRef.current = null
      inFlight.current = false
    }
  }

  return (
    <div className="subscribe-page">
      <Header />
      <main className="unsubscribe-main" aria-labelledby="unsubscribe-heading">
        <EnvelopeOpen size={49} weight="light" aria-hidden="true" />
        <p className="subscribe-script">Letters from Wei</p>
        <h1 id="unsubscribe-heading" ref={headingRef} tabIndex={-1}>{status === 'success' ? 'You’re off the list.' : 'Need a little less mail?'}</h1>
        <WaveFlourish />
        {status === 'success' ? (
          <p role="status">You’ve unsubscribed from Letters from Wei. Thanks for being part of the adventure. The journal is always here when you feel like exploring.</p>
        ) : validLink ? (
          <>
            <p>You can unsubscribe from Letters from Wei below. No hard feelings, and you’re always welcome back.</p>
            {error && <p className="unsubscribe-error" role="alert">{error}</p>}
            <button className="unsubscribe-button" type="button" onClick={unsubscribe} disabled={status === 'submitting'}>{status === 'submitting' ? 'Updating your preference…' : 'Unsubscribe from the newsletter'}</button>
          </>
        ) : (
          <p>This link is missing your mailing-list details. Please use the unsubscribe link included with your newsletter.</p>
        )}
        <a className="unsubscribe-back" href="/"><ArrowLeft size={16} aria-hidden="true" /> Back to the journal</a>
      </main>
    </div>
  )
}
