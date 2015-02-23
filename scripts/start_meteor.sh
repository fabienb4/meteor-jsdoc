#!/bin/bash

cd <%= docsPath %>

touch app.log

meteor --port <%= meteorPort %> >> app.log 2>&1 &
