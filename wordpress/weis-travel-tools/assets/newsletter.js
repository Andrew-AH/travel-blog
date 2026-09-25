/* Newsletter forms remain independent of React, a theme, or a build pipeline. */
(function () {
  'use strict';
  const draftKey = 'wei-newsletter-email-draft';

  async function post(endpoint, data) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) {
        const error = new Error(result.error || result.message || 'We couldn’t save your changes just now. Please try again.');
        error.fieldErrors = result.fieldErrors;
        throw error;
      }
      return result;
    } finally { window.clearTimeout(timeout); }
  }

  function init() {
    document.querySelectorAll('[data-wei-newsletter-teaser]').forEach(form => {
      if (form.dataset.initialized) return;
      form.dataset.initialized = 'true';
      form.addEventListener('submit', event => {
        event.preventDefault();
        try { window.sessionStorage.setItem(draftKey, form.querySelector('input[type="email"]').value.trim()); }
        catch (_) { /* Signup still works if browser storage is unavailable. */ }
        window.location.assign(form.dataset.signupUrl);
      });
    });

    document.querySelectorAll('[data-wei-newsletter-signup]').forEach(form => {
      if (form.dataset.initialized) return;
      form.dataset.initialized = 'true';
      const fields = form.querySelector('fieldset');
      const submit = form.querySelector('[type="submit"]');
      const idleLabel = submit.textContent;
      const feedback = form.querySelector('[data-newsletter-feedback]');
      try {
        form.elements.email.value = (window.sessionStorage.getItem(draftKey) || '').slice(0, 254);
        window.sessionStorage.removeItem(draftKey);
      } catch (_) { /* The form also works without session storage. */ }

      function clearErrors() {
        form.querySelectorAll('[data-error-for]').forEach(node => { node.hidden = true; node.textContent = ''; });
        form.querySelectorAll('[aria-invalid]').forEach(node => node.removeAttribute('aria-invalid'));
        feedback.hidden = true;
        feedback.textContent = '';
      }

      function showErrors(errors) {
        Object.entries(errors || {}).forEach(([name, message]) => {
          const input = form.elements.namedItem(name);
          const node = Array.from(form.querySelectorAll('[data-error-for]')).find(item => item.dataset.errorFor === name);
          if (input && node) {
            input.setAttribute('aria-invalid', 'true');
            node.textContent = String(message);
            node.hidden = false;
          }
        });
        form.querySelector('[aria-invalid="true"]')?.focus();
      }

      form.addEventListener('input', event => {
        event.target.removeAttribute('aria-invalid');
        const node = Array.from(form.querySelectorAll('[data-error-for]')).find(item => item.dataset.errorFor === event.target.name);
        if (node) node.hidden = true;
        feedback.hidden = true;
      });

      form.addEventListener('submit', async event => {
        event.preventDefault();
        if (fields.disabled) return;
        clearErrors();
        const email = form.elements.email.value.trim();
        const firstName = form.elements.firstName.value.trim();
        const consent = form.elements.consent.checked;
        const errors = {};
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) errors.email = 'Enter a valid email address, like you@example.com.';
        if (firstName.length > 80) errors.firstName = 'Keep your first name under 80 characters.';
        if (!consent) errors.consent = 'Please tick the box to join the mailing list.';
        if (Object.keys(errors).length) { showErrors(errors); return; }
        const website = form.elements.website.value;
        fields.disabled = true;
        form.setAttribute('aria-busy', 'true');
        submit.textContent = 'Joining the journey…';
        try {
          await post(form.dataset.endpoint, { email, firstName, consent, website });
          const success = form.parentElement.querySelector('[data-newsletter-success]');
          form.hidden = true;
          success.hidden = false;
          form.reset();
          success.querySelector('h3').focus();
        } catch (error) {
          fields.disabled = false;
          showErrors(error.fieldErrors);
          feedback.textContent = error.name === 'AbortError' || error instanceof TypeError
            ? 'We couldn’t confirm your signup. Check your connection and try again; the same email won’t be added twice.'
            : error.message;
          feedback.hidden = false;
        } finally {
          fields.disabled = false;
          form.setAttribute('aria-busy', 'false');
          submit.textContent = idleLabel;
        }
      });
    });

    document.querySelectorAll('[data-wei-newsletter-unsubscribe]').forEach(panel => {
      if (panel.dataset.initialized) return;
      panel.dataset.initialized = 'true';
      const token = new URLSearchParams(window.location.hash.slice(1)).get('token') || '';
      const button = panel.querySelector('[data-unsubscribe-button]');
      const feedback = panel.querySelector('[data-newsletter-feedback]');
      const copy = panel.querySelector('[data-unsubscribe-copy]');
      if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return;
      button.hidden = false;
      copy.textContent = 'You can unsubscribe from Letters from Wei below. No hard feelings, and you’re always welcome back.';
      button.addEventListener('click', async () => {
        if (button.disabled) return;
        button.disabled = true;
        button.textContent = 'Updating your preference…';
        feedback.hidden = true;
        try {
          await post(panel.dataset.endpoint, { token });
          button.hidden = true;
          const heading = panel.querySelector('h1');
          heading.textContent = 'You’re off the list.';
          copy.setAttribute('role', 'status');
          copy.textContent = 'You’ve unsubscribed from Letters from Wei. Thanks for being part of the adventure. The journal is always here when you feel like exploring.';
          heading.focus();
        } catch (error) {
          feedback.textContent = error.name === 'AbortError' || error instanceof TypeError
            ? 'We couldn’t confirm that you’ve unsubscribed. Check your connection and try again.'
            : error.message;
          feedback.hidden = false;
        } finally {
          button.disabled = false;
          button.textContent = 'Unsubscribe from the newsletter';
        }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
