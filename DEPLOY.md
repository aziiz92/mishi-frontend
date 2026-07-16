# Deploying the Mishi landing page

The landing page is a static Vite application served by Caddy. Traefik, which
is managed by Dokploy, is the only public reverse proxy.

## Branch flow

- `develop` is the integration branch and is not deployed.
- `main` is the production branch.
- Feature branches start from an up-to-date `develop` branch.
- Pull requests target `develop` first.
- Production promotion is a pull request from `develop` to `main`.

The `CI` workflow runs on pull requests and pushes targeting `develop` or
`main`. Dokploy handles deployment directly through its GitHub integration, so
GitHub Actions stores no Dokploy URL, API key or application ID.

## Dokploy application

Create one Dokploy application from this repository:

| Environment | Git branch | Container port |
| --- | --- | --- |
| Production | `main` | `8080` |

For this application:

- use build type `Dockerfile`;
- set Build Path to `/`;
- use `/Dockerfile` as the Dockerfile path;
- route the domain to container port `8080` through Traefik;
- configure the health check path as `/healthz`;
- do not publish a host port;
- do not add Caddy TLS configuration;
- enable Dokploy Auto Deploy for `main`.

The Docker build accepts `VITE_API_URL` and defaults to
`https://api.mishi.app`. It is a public browser endpoint, never a secret.

## Shared menus

The public join view is served by this application at `/s/{share_token}`. The
token is a bearer link: Caddy prevents indexing and sends only the site origin
as the referrer.

Once this version is live, configure the backend application with:

```dotenv
PUBLIC_BASE_URL=https://api.mishi.app
PUBLIC_WEB_URL=https://mishi.app
CORS_ALLOW_ORIGINS=https://mishi.app
```

`PUBLIC_BASE_URL` continues to name the API and its media proxy. Only
`PUBLIC_WEB_URL` composes links shown by the mobile Share sheet.

DNS, domains, certificates and public ports `80/443` remain managed by
Cloudflare and Dokploy/Traefik.

## GitHub configuration

Protect `develop` and `main` with the `Lint, test and build` and
`Build container` checks. Require pull requests for both branches and prevent
direct pushes. This matters because Dokploy Auto Deploy reacts to a branch push
independently of the CI workflow running for that same push. Only `main` is
connected to Dokploy, so merges into `develop` run CI without deploying. With
protected branches, a production deployment from `main` has already passed the
required pull-request checks.

## Local verification

Use Node.js 24 and npm 11.16.0:

```sh
npm ci
npm run lint
npm test
npm run build
docker build -t mishi-frontend:local .
```

The image declares port `8080` and an internal `/healthz` health check. An
`EXPOSE` instruction documents the container port; it does not publish that
port on the VPS.
