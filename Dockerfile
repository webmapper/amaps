FROM node:10.10 AS build-nlmaps
LABEL maintainer="datapunt@amsterdam.nl"

WORKDIR /app
COPY package.json package.json
RUN npm install shx
COPY scripts /app/scripts
COPY config /app/config
RUN npm run nlmaps

FROM node:10.10 AS build-deps
LABEL maintainer="datapunt@amsterdam.nl"

WORKDIR /app
COPY --from=build-nlmaps /app/nlmaps /app/nlmaps
COPY package.json package.json
RUN npm install
COPY scripts /app/scripts
COPY test /app/test
COPY src /app/src
COPY .eslintrc.js /app/.eslintrc.js
COPY .eslintignore /app/.eslintignore
COPY rollup.index.js /app/rollup.index.js
COPY rollup.pointquery.js /app/rollup.pointquery.js
COPY rollup.multiselect.js /app/rollup.multiselect.js
#build amaps library which is used by test.html
RUN npm run build-amaps


# Web server image
FROM nginx:1.12.2-alpine
COPY --from=build-deps /app/test /usr/share/nginx/html
