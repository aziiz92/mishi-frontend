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
`main`. Dokploy handles deployment directly through its GitHub integration, so
GitHub Actions stores no Dokploy URL, API key or application ID.

## Dokploy applications

Create two separate Dokploy applications from this repository:

| Environment | Git branch | Container port |
| --- | --- | --- |
| Development | `develop` | `8080` |
| Production | `main` | `8080` |

For both applications:

- use build type `Dockerfile`;
- set Build Path to `/`;
- use `/Dockerfile` as the Dockerfile path;
- route the domain to container port `8080` through Traefik;
- configure the health check path as `/healthz`;
- do not publish a host port;
- do not add Caddy TLS configuration;
- enable Dokploy Auto Deploy for the configured branch.

DNS, domains, certificates and public ports `80/443` remain managed by
Cloudflare and Dokploy/Traefik.

## GitHub configuration

Protect `develop` and `main` with the `Lint, test and build` and
`Build container` checks. Require pull requests for both branches and prevent
direct pushes. This matters because Dokploy Auto Deploy reacts to a branch push
independently of the CI workflow running for that same push. With protected
branches, a deployed merge has already passed the required pull-request checks.

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
