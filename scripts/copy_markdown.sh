#!/usr/bin/env bash

cd <%= projectPath %>
echo `find . -type f -name "*.partial.md" ! -path "*/.meteor/" ! -path "*/node_modules/*"`
find . -type f -name "*.partial.md" ! -path "*/.meteor/" ! -path "*/node_modules/*" -exec cp -f {} "<%= docsPath %>/client/templates" \;
