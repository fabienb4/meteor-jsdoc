#!/bin/bash

mkdir -p $DOCS_PATH/client/data

cd <%= projectPath %>
# Call git grep to find all js files with the appropriate comment tags,
# and only then pass it to JSDoc which will parse the JS files.
# This is a whole lot faster than calling JSDoc recursively.
git grep -al --no-index "@summary" | xargs -L 10000 -t \
    <%= nodePath %> \
    <%= jsdocPath %> \
    -t <%= jsdocTmplPath %> \
    -c <%= jsdocConf %> \
    -d $DOCS_PATH
