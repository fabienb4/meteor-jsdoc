#!/usr/bin/env bash

mkdir -p $DOCS_PATH/client/data

cd <%= projectPath %>

# Call grep to find all js files with the appropriate comment tags,
# and only then pass it to JSDoc which will parse the JS files.
# This is a whole lot faster than calling JSDoc recursively.
find . -type f ! -path "*/.git/*" ! -path "*/.meteor/*" | xargs grep -lswH "@summary" | xargs -L 10000 -t \
    <%= nodePath %> \
    <%= jsdocPath %> \
    <%= jsdocArgs %> \
    -t <%= jsdocTmplPath %> \
    -c <%= jsdocConf %> \
    -d $DOCS_PATH \
    2>&1
