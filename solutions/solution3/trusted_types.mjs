import { createTrustedHtmlFromStringKnownToBeSafe, publicKey as CREATE_TRUSTED_KEY } from './create_trusted'

function unwrap(x) {
  if (x && typeof x === 'object') {
    let v = frenemies.unbox(x.content, (k) => k === CREATE_TRUSTED_KEY && k())
    if (v && v.type === 'html') { return v.text }
  }
  return void 0
}

export class TrustedHtml {
  constructor(content) {
    this.content = content;
    Object.freeze(this);
  }
}

Object.defineProperties(
  TrustedHtml,
  {
    unwrap: { value: unwrap },
    EMPTY: { value: createTrustedHtmlFromStringKnownToBeSafe('') }
  })
