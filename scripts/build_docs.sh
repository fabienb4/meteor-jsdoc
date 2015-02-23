#!/bin/bash

mkdir -p $DOCS_PATH/client/data

cd <%= projectPath %>
# Call git grep to find all js files with the appropriate comment tags,
# and only then pass it to JSDoc which will parse the JS files.
# This is a whole lot faster than calling JSDoc recursively.
git grep -al "@summary" | xargs -L 10000 -t \
    "/usr/bin/node" \
    "/usr/bin/jsdoc" \
    -t <%= jsDocTmplPath %> \
    -c <%= jsdocConf %> \
    -d $DOCS_PATH
