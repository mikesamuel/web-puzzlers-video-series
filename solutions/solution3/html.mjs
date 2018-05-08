// Here's some client-side code.
// It produces HTML that it renders client-side.
// Can you figure out how to XSS it by passing the render() function a string of JSON?

import { TrustedHtml } from './trusted_types'
import { createTrustedHtmlFromStringKnownToBeSafe } from './create_trusted'

function escapeHtml(s) {
  let tt = TrustedHtml.unwrap(s)
  if (typeof tt === 'string') {
    return tt
  }
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function stripTags(html) {
  let tt = TrustedHtml.unwrap(html)
  if (typeof tt === 'string') {
    return tt
  }
  for (let s = '' + html, sp; ; s = sp) {
    sp = s.replace(/<\/?[\w!?][^>]*>?/g, '')
    if (s === sp) {
      return s.replace(/</g, '&lt;')
    }
  }
}

// Called for html`...`
export function html(strings, ...data) {
  let { raw } = strings
  let html = ''
  let n = data.length
  for (let i = 0; i < n; ++i) {
    let chunk = raw[i], value = data[i]
    let escaper = escapeHtml
    // html`foo $${x}` was used to apply stripTags instead.
    if (/[$]$/.test(chunk) && !/(?:^|[^\\])[\\](?:\\\\)*[$]$/.test(strings[i])) {
      // $ at end with an odd number of backslashes means an escaped $.
      chunk = chunk.substring(0, chunk.length - 1)
      escaper = stripTags
    }
    html += chunk + escaper(value)
  }
  return createTrustedHtmlFromStringKnownToBeSafe(html + raw[n])
}
