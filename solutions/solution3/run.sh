#!/bin/bash

rm -rf node_modules/rewrite-imports-and-add-module-ids
rsync -av --exclude='node_modules' --exclude='*~' \
      rewrite-imports-and-add-module-ids \
      node_modules/

mkdir -p out
for mjsfile in *.mjs; do
    echo "Babbling $mjsfile"
    (
        ## Polyfill.  Babel does a poor job with injected imports.  https://github.com/babel/babel/issues/1979 ?
        echo -n "import { makeFrenemies } from './frenemies';"
        echo -n " const frenemies = makeFrenemies(\"$mjsfile\");"
        echo -n "export let {publicKey} = frenemies;";
        # Simulate import hooks
        ./node_modules/.bin/babel \
            --no-babelrc \
            --source-type module \
            --plugins=rewrite-imports-and-add-module-ids \
            "$mjsfile"
    ) > out/"$mjsfile"
done
cp ../frenemies.mjs out/

node --experimental-modules out/index.mjs \
     '{ "legacyUserId": 85322 }' \
     '{ "properNoun1": "<b>Carol</b>" }' \
     '{ "adjective": "<b>bold</b>" }' \
     '{ "legacyUserId": "85322.0", "properNoun1": "<script>alert(parent.render)</script>" }'
