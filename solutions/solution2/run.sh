#!/bin/bash
set -e

rm -rf out-old out-new
mkdir  out-old out-new
cp ../frenemies.mjs out-old/
cp ../frenemies.mjs out-new/

# Add polyfills
for sourcefile in *.mjs; do
    (
        echo -n "/* Polyfill */ import {makeFrenemies} from './frenemies'; const frenemies = makeFrenemies('$sourcefile'); export let {publicKey} = frenemies; /* End polyfill */";
        cat "$sourcefile"
    ) > out-new/"$sourcefile"

    (
        echo -n "/* Polyfill */ import {makeFrenemies} from './frenemies'; const frenemies = makeFrenemies('$sourcefile'); export let {publicKey} = frenemies; /* End polyfill */";
        cat original/"$sourcefile"
    ) > out-old/"$sourcefile"
done

echo
echo OLD BEHAVIOR
node --experimental-modules out-old/index.mjs \
     '{ "type": "pwd-reset", "userId": "b678" }' \
     '{ "type": "public",    "userId": "b678", "realName": "" }'

echo
echo NEW BEHAVIOR
node --experimental-modules out-new/index.mjs \
     '{ "type": "pwd-reset", "userId": "b678" }' \
     '{ "type": "public",    "userId": "b678", "realName": "" }'

echo
echo DIFFERENCE
for sourcefile in *.mjs; do
    diff -u {original,.}/"$sourcefile" || true
done
