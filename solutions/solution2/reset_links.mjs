import crypto from 'crypto'
import { enqueuePasswordResetEmail, publicKey as SEND_RESET_EMAIL_KEY } from './send_reset_email'
import { getUserRecord } from './index'

let randomByteString = (n) => crypto.randomBytes(n).toString('base64')

// An in-memory store of reset links.  Periodically pruned of expired entries.
let resetLinks = {}

export function getPasswordResetLink(_, req) {
  let nonce = randomByteString(64)
  let expiry = Date.now() + 10 * 60 /* s/min */ * 1000 /* ms/s */
  resetLinks[nonce] = { userId: req.userId, expiry }
  let url = frenemies.box(
      `https://uforgot.example.com/${nonce}`,
      k => k === SEND_RESET_EMAIL_KEY && k())
  // Bundle data for the email template.
  let data = Object.assign(getUserRecord(req), req, { url })
  enqueuePasswordResetEmail(data)
  // Return just enough data to display the "Reset link sent" page
  let    { userId, locale } = data
  return { userId, locale }
}
