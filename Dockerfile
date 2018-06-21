FROM node:8.9 AS build-nlmaps
MAINTAINER hans@webmapper.net
WORKDIR /app
COPY package.json package.json
RUN npm install shx
COPY scripts /app/scripts
COPY config /app/config
RUN npm run nlmaps



FROM node:8.9 AS build-deps
MAINTAINER hans@webmapper.net
WORKDIR /app
COPY --from=build-nlmaps /app/nlmaps /app/nlmaps
RUN apt-get update && apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
COPY package.json package.json
RUN npm install
COPY scripts /app/scripts
COPY test /app/test
COPY src /app/src
COPY .eslintrc.js /app/.eslintrc.js
COPY .eslintignore /app/.eslintignore
COPY rollup.index.js /app/rollup.index.js
COPY rollup.mora.js /app/rollup.mora.js
#build amaps library which is used by test.html
RUN npm run build-amaps


# Web server image
FROM nginx:1.12.2-alpine
COPY --from=build-deps /app/test /usr/share/nginx/html
