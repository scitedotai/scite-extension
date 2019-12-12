#!/bin/bash
set -e
npx parcel build src/index.js
cp -v dist/index.js extension
cp -v dist/index.css extension
cp -v src/background.js extension/background.js
npm run build:module
