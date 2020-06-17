#!/bin/bash
set -e
npx parcel build src/index.js
cp -v dist/index.js extension
cp -v dist/index.css extension/styles.css 
cp -v src/background.js extension/background.js
