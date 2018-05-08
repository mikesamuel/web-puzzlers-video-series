// Safe since only passed string constants.
import { createTrustedHtmlFromStringKnownToBeSafe as create } from './create_trusted'

// Legacy users from the bip bop acquisition get to keep their usernames with colors.
export let legacyNames = {
  85322: create('<font color=red>A</font><font color=orange>l</font><font color=yellow>i</font><font color=green>c</font><font color=blue>e</font>'),
  11673: create('<font color=black>Bob</font>')
}
