FROM nginx:1.25.4-alpine3.18
LABEL maintainer="datapunt@amsterdam.nl"

ENV DEFAULT_TZ=Europe/Amsterdam

RUN apk add -U tzdata \
  && cp /usr/share/zoneinfo/${DEFAULT_TZ} /etc/localtime \
  && apk del tzdata \
  && rm -rf \
  /var/cache/apk/*

COPY dist /usr/share/nginx/html
