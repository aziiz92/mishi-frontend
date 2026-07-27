FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --global npm@11.16.0
RUN npm ci

COPY . .
ARG VITE_API_URL=https://api.mishi.app
ARG VITE_ANALYTICS_URL
ARG VITE_APP_STORE_URL
ARG VITE_APP_STORE_BADGE_FR_URL
ARG VITE_CANONICAL_BASE_URL=https://mishi.app
ARG VITE_RELEASE_STRICT=0
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ANALYTICS_URL=$VITE_ANALYTICS_URL
ENV VITE_APP_STORE_URL=$VITE_APP_STORE_URL
ENV VITE_APP_STORE_BADGE_FR_URL=$VITE_APP_STORE_BADGE_FR_URL
ENV VITE_CANONICAL_BASE_URL=$VITE_CANONICAL_BASE_URL
ENV VITE_RELEASE_STRICT=$VITE_RELEASE_STRICT
RUN npm run build

FROM caddy:2.10-alpine

RUN addgroup --system app && adduser --system --ingroup app app

COPY Caddyfile /etc/caddy/Caddyfile
COPY --chown=app:app --from=build /app/dist /srv

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
