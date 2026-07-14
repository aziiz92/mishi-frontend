FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --global npm@11.16.0
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2.10-alpine

RUN addgroup --system app && adduser --system --ingroup app app

COPY Caddyfile /etc/caddy/Caddyfile
COPY --chown=app:app --from=build /app/dist /srv

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
