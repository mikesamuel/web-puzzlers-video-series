import { html } from './html'
import { legacyNames } from './legacy_names'
import { TrustedHtml } from './trusted_types'
import process from 'process'

function renderHtml(json) {
  let inputs = JSON.parse(json)

  let adjective = inputs.adjective || 'awesome'
  let noun1 = inputs.noun1 || 'spoon'
  let noun2 = inputs.noun2 || 'soup'
  let properNoun1 = legacyNames[inputs.legacyUserId] || inputs.properNoun1 || 'You'
  let properNoun2 = inputs.properNoun2 || 'Management'
  let verb = inputs.verb || 'stir'

  // All inputs are auto-escaped except for known strings in legacyNames.
  return html`
    <html>
      <title>Hello, here's a thing, goodbye</title>
      <body>
        <h1>Dear $${properNoun1},</h1>
        <p>Please find a ${noun1} attached that you can use to ${verb} your ${noun2}.</p>
        <p>Have an ${adjective} day!</p>
        <p>Sincerely, ${properNoun2}</p>
      </body>
    </html>`
}


process.argv.slice(2).forEach(arg => {
  console.group(arg)
  try {
    console.log(TrustedHtml.unwrap(renderHtml(arg)))
  } finally {
    console.groupEnd()
  }
})
