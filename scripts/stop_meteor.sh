#!/bin/bash

cd <%= docsPath %>

kill -9 `ps ax | grep meteor | grep "main.js --port <%= meteorPort %>" | awk '{print $1}'`
kill -9 `ps ax | grep mongod | grep "dbpath <% docsPath %>" | awk '{print $1}'`
