import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { CheckCircle } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt'
import './newsletter-signup.css'

const draftKey = 'wei-newsletter-email-draft'
const consentText = 'I agree to receive destination ideas, travel tips, and affordable travel inspiration from Wei’s Tiny Adventures. I can unsubscribe at any time.'

function readDraftEmail() {
  try { return window.sessionStorage.getItem(draftKey)?.slice(0, 254) || '' }
  catch { return '' }
}

export default function NewsletterSignupForm() {
  const [email, setEmail] = useState(readDraftEmail)
  const [firstName, setFirstName] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [feedback, setFeedback] = useState('')
  const formRef = useRef(null)
  const successRef = useRef(null)
  const requestRef = useRef(null)
  const inFlight = useRef(false)

  useEffect(() => {
    try { window.sessionStorage.removeItem(draftKey) } catch { /* The form also works without storage. */ }
    return () => requestRef.current?.abort()
  }, [])

  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
  }, [status])

  function updateField(field, value) {
    if (field === 'email') setEmail(value)
    if (field === 'firstName') setFirstName(value)
    if (field === 'consent') setConsent(value)
    setErrors(current => ({ ...current, [field]: undefined }))
    setFeedback('')
  }

  function showErrors(fieldErrors) {
    setErrors(fieldErrors)
    requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus())
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (inFlight.current) return
    const fieldErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) fieldErrors.email = 'Enter a valid email address, like you@example.com.'
    if (firstName.trim().length > 80) fieldErrors.firstName = 'Keep your first name under 80 characters.'
    if (!consent) fieldErrors.consent = 'Please tick the box to join the mailing list.'
    if (Object.keys(fieldErrors).length) { showErrors(fieldErrors); return }

    inFlight.current = true
    setStatus('submitting')
    setErrors({})
    setFeedback('')
    const controller = new AbortController()
    requestRef.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          interests: [],
          consent,
          website: formRef.current.elements.website.value,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.ok !== true) {
        setStatus('idle')
        if (result?.fieldErrors) showErrors(result.fieldErrors)
        setFeedback(result?.error || 'We couldn’t save your signup just now. Please try again in a moment.')
        return
      }
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('idle')
      setFeedback('We couldn’t confirm your signup. Check your connection and try again; the same email won’t be added twice.')
    } finally {
      window.clearTimeout(timeout)
      requestRef.current = null
      inFlight.current = false
    }
  }

  if (status === 'success') {
    return (
      <div className="newsletter-signup newsletter-success" role="status">
        <CheckCircle size={48} weight="light" aria-hidden="true" />
        <h3 ref={successRef} tabIndex={-1}>You’re on the list!</h3>
        <p>Thanks for coming along. Your next little dose of travel inspiration will arrive when there’s something lovely to share.</p>
        <span className="newsletter-success-signoff">See you on the next adventure,<br />Wei</span>
        <a href="/destinations">Find your next destination <ArrowRight size={16} aria-hidden="true" /></a>
      </div>
    )
  }

  return (
    <form className="newsletter-signup" ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={status === 'submitting'}>
      <fieldset className="newsletter-fields" disabled={status === 'submitting'}>
        <legend className="sr-only">Your newsletter signup</legend>
        <div className="newsletter-field">
          <label htmlFor="signup-first-name">First name <span>(optional)</span></label>
          <input id="signup-first-name" name="firstName" type="text" autoComplete="given-name" placeholder="What should I call you?" value={firstName} maxLength={80} onChange={event => updateField('firstName', event.target.value)} aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? 'signup-name-error' : undefined} />
          {errors.firstName && <p className="newsletter-field-error" id="signup-name-error">{errors.firstName}</p>}
        </div>
        <div className="newsletter-field">
          <label htmlFor="signup-email">Email address <span>(required)</span></label>
          <input id="signup-email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" required value={email} maxLength={254} onChange={event => updateField('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'signup-email-error' : undefined} />
          {errors.email && <p className="newsletter-field-error" id="signup-email-error">{errors.email}</p>}
        </div>
        <div className="newsletter-consent">
          <label>
            <input type="checkbox" name="consent" checked={consent} required onChange={event => updateField('consent', event.target.checked)} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'signup-consent-error' : undefined} />
            <span>{consentText}</span>
          </label>
          {errors.consent && <p className="newsletter-field-error" id="signup-consent-error">{errors.consent}</p>}
        </div>
        <div className="newsletter-honeypot" aria-hidden="true">
          <label htmlFor="signup-website">Leave this field empty</label>
          <input id="signup-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        {feedback && <p className="newsletter-submit-error" role="alert">{feedback}</p>}
        <button className="newsletter-submit" type="submit" disabled={status === 'submitting'}>
          <PaperPlaneTilt size={18} weight="regular" aria-hidden="true" />
          {status === 'submitting' ? 'Joining the journey…' : 'Join the journey'}
        </button>
      </fieldset>
      <p className="newsletter-small-note">A few good stories. A little trip inspiration. Always free.</p>
    </form>
  )
}
