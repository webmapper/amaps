#!/bin/sh
git clone https://github.com/webmapper/nlmaps
cd nlmaps
npm install
NODE_ENV=production node scripts/build -c ../amsterdam.config.js
node scripts/publish
