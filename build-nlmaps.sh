#!/bin/sh
git clone https://github.com/webmapper/nlmaps
cd nlmaps
npm install
NODE_ENV=production node scripts/build -c ../config/amsterdam.config.js
node scripts/publish
