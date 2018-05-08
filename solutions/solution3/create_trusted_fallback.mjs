import { TrustedHtml } from './trusted_types'

export function createTrustedHtmlFromStringKnownToBeSafe(text) {
  if (typeof text !== 'string') {
    throw new Error(typeof text)
  }
  return TrustedHtml.EMPTY
}
