// https://codepen.io/mikesamuel/pen/XEEJov?editors=1011

// Assumes <iframe id="destination" style="height: 12em" srcdoc="render() puts HTML here"></iframe>



// Here's some client-side code.
// It produces HTML that it renders client-side.
// Can you figure out how to XSS it by passing the render() function a string of JSON?

function escapeHTML(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Called for html`...`
function html(strings, ...data) {
  let { raw } = strings
  let html = ''
  let n = data.length
  for (let i = 0; i < n; ++i) {
    let chunk = raw[i], value = data[i]
    // x in html`foo $${x}` is not escaped, but in html`foo \$${x}` it is.
    if (/[$]$/.test(chunk) && !/(?:^|[^\\])[\\](?:\\\\)*[$]$/.test(strings[i])) {
      // $ at end with an odd number of backslashes means an escaped $.
      chunk = chunk.substring(0, chunk.length - 1)
    } else {
      value = escapeHTML(value)
    }
    html += chunk + value
  }
  return html + raw[n]
}

function stripTags(html) {
  for (let s = '' + html, sp; ; s = sp) {
    sp = s.replace(/<\/?[\w!?][^>]*>?/g, '')
    if (s === sp) {
      return s.replace(/</g, '&lt;')
    }
  }
}

// Legacy users from the bip bop acquisition get to keep their usernames with colors.
let legacyNames = {
  85322: '<font color=red>A</font><font color=orange>l</font><font color=yellow>i</font><font color=green>c</font><font color=blue>e</font>',
  11673: '<font color=black>Bob</font>'
}

function isLegacyUser(legacyUserId) {
  return legacyNames.hasOwnProperty(legacyUserId)
}

function render(json) {
  let inputs = JSON.parse(json)
  let legacyUserId = +inputs.legacyUserId  // See above

  let adjective = inputs.adjective || 'awesome'
  let noun1 = inputs.noun1 || 'spoon'
  let noun2 = inputs.noun2 || 'soup'
  let properNoun1 = legacyNames[inputs.legacyUserId] || inputs.properNoun1 || 'You'
  let properNoun2 = inputs.properNoun2 || 'Management'
  let verb = inputs.verb || 'stir'

  // All inputs are auto-escaped except for known strings in legacyNames.
  document.getElementById('destination').srcdoc = html`
    <html>
      <title>Hello, here's a thing, goodbye</title>
      <body>
        <h1>Dear $${(isLegacyUser(legacyUserId) ? (x=>x) : stripTags)(properNoun1)},</h1>
        <p>Please find a ${noun1} attached that you can use to ${verb} your ${noun2}.</p>
        <p>Have an ${adjective} day!</p>
        <p>Sincerely, ${properNoun2}</p>
      </body>
    </html>`
}
