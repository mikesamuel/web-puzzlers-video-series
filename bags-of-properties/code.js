// https://codepen.io/anon/pen/RMjrme?editors=0012

// This is meant as server-side JavaScript, but these adapters let us debug in a browser.
let randomByteString = typeof require === 'function'
  && ((n) => require('crypto').randomBytes(n).toString('base64'))
  || ((n) => btoa(String.fromCharCode.apply(null, crypto.getRandomValues(new Uint8Array(n)))))
// To win, violate security properties by passing primitives to
// processJSON.  All other state is local to the module.
// 'a123' is the current user.
if (typeof module !== 'undefined') {
  module.exports = { processJSON }
}
// Win conditions include
// *  Changing a userDatabase record other than a123's or forging a record.
// *  Accessing a realName of a user other than a123
// *  Causing a reset link url to be one of your choosing.
// *  Leaking a resetLink other than one for a123's or getting it sent/written to a
//    source other than the email of record for that account.
// *  Reliably fabricating or overwriting a resetLink or resurrecting an expired
//    resetLink.
// *  Denying service by causing a user's private profile request or reset link
//    requests to consistently fail to produce the desired results.
// Please consider all comments hereafter as those of the author whose code you are attacking.

// Please imagine that these records are in-memory cached records from the database.
let userDatabase = {
  'a123': { displayName: 'AL1C3', realName: 'Alice', locale: 'en', timeZone: '+2', userId: 'a123' },
  'b678': { displayName: 'B0B', realName: 'Bob', userId: 'b678' },
  // etc.
}

// A table of values to substitute when we have a userId for a session that
// has not yet converted to a logged-in account.
let newUser = {
  'en': { displayName: 'new account', locale: 'en' },
  'es': { displayName: 'nueva cuenta', locale: 'es' },
  // etc.
}

// An in-memory store of reset links.  Periodically pruned of expired entries.
let resetLinks = {}

function getUserRecord(req) {
  return userDatabase[req.userId] || newUser[req.locale] || newUser['en']
}

function getPublicProfile(_, req) {
  let userRecord = getUserRecord(req)
  // Cherry-pick the public bits.
  let { displayName } = userRecord
  // Add together the userRecord, but also echo back userId and display prefs (locale, and timezone).
  let result = Object.assign({}, req, { displayName })
  // Do not fall back to the user record prefs.  We can display the target user's public profile page in
  // the requesting user's locale.
  if ('realName' in result) {  // Sanity check: do not leak real name.
    throw new Error(`${JSON.stringify(req)} -> ${JSON.stringify(userRecord)}`)
  }
  return result
}

function getPrivateProfile(current, req) {
  // Add together the userRecord,
  // but also echo back userId and presentation preferences (locale and timezone).
  let result = Object.assign({}, req, getUserRecord(current))
  return result
}

function getPasswordResetLink(_, req) {
  let nonce = randomByteString(64)
  let expiry = Date.now() + 10 * 60 /* s/min */ * 1000 /* ms/s */
  resetLinks[nonce] = { userId: req.userId, expiry }
  // Bundle data for the email template.
  let data = Object.assign(getUserRecord(req), req, { url: `https://uforgot.example.com/${nonce}` })
  enqueuePasswordResetEmail(data)
  // Return just enough data to display the "Reset link sent" page
  let    { userId, locale } = data
  return { userId, locale }
}

function enqueuePasswordResetEmail(data) {
  let email = `Dear ${data.displayName}, ${data.url} will let you reset your password.  Have an awesome day!`
  // Imagine the email is actually enqueued to the email of record for data.userId.
  console.log(`Sent password reset email to ${data.userId}`)
}

function process(current, request) {
  let { type, ...req } = request
  switch (type) {
  case 'public':    return getPublicProfile(current, req)
  case 'private':   return getPrivateProfile(current, req)
  case 'pwd-reset': return getPasswordResetLink(current, req)
  }
}

function processJSON(input) {
  let current = { userId: 'a123' }  // Imagine we do some auth as necessary.
  try {
    return JSON.stringify(process(current, JSON.parse(input)))
  } catch (ex) {
    console.error(`Error: ${ex.message}`)
  }
}
