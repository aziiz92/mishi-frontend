# Deploying the Mishi landing page

The landing page is a static Vite application served by Caddy. Traefik, which
is managed by Dokploy, is the only public reverse proxy.

## Branch flow

- `develop` is the integration and development deployment branch.
- `main` is the production branch.
- Feature branches start from an up-to-date `develop` branch.
- Pull requests target `develop` first.
- Production promotion is a pull request from `develop` to `main`.

The `CI` workflow runs on pull requests and pushes targeting `develop` or
`main`. The `Deploy` workflow only runs after a successful `CI` push workflow,
so pull requests never trigger a deployment.

## Dokploy applications

Create two separate Dokploy applications from this repository:

| Environment | Git branch | GitHub environment | Container port |
| --- | --- | --- | --- |
| Development | `develop` | `development` | `8080` |
| Production | `main` | `production` | `8080` |

For both applications:

- use build type `Dockerfile`;
- set Build Path to `/`;
- use `/Dockerfile` as the Dockerfile path;
- route the domain to container port `8080` through Traefik;
- configure the health check path as `/healthz`;
- do not publish a host port;
- do not add Caddy TLS configuration;
- disable Dokploy's direct Git auto-deploy so a push cannot bypass CI.

DNS, domains, certificates and public ports `80/443` remain managed by
Cloudflare and Dokploy/Traefik.

## GitHub configuration

Create GitHub environments named `development` and `production`. Add this
environment secret to each one, using the matching Dokploy application ID:

- `DOKPLOY_APPLICATION_ID`

Add these repository or organization secrets:

- `DOKPLOY_URL`: the Dokploy base URL, without a trailing slash;
- `DOKPLOY_API_KEY`: a Dokploy API token allowed to deploy these applications.

Protect `develop` and `main` with the `Lint, test and build` and
`Build container` checks. Require pull requests for both branches. Production
may additionally require approval on the GitHub `production` environment.

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
