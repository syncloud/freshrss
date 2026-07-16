# FreshRSS for Syncloud

[FreshRSS](https://freshrss.org) packaged as a Syncloud app — a free, self-hostable RSS and Atom feed aggregator.

## Storage & auth

- **Database:** SQLite, stored under the Syncloud storage dir via FreshRSS's `DATA_PATH`.
- **Auth:** Syncloud SSO. nginx gates access with the platform's Authelia `authrequest` and
  passes the authenticated `Remote-User` to FreshRSS (`auth_type=http_auth`), which
  auto-provisions the account on first login (`http_auth_auto_register`). No passwords or
  user management live in the app. FreshRSS's own token-authenticated APIs (Google Reader,
  Fever) under `/api/` bypass the SSO gate.

## Build & CI

Upstream FreshRSS is pinned as `local version` in `.drone.jsonnet`. CI builds `amd64`,
`arm64` and `arm`, tests the bundled nginx/php/cli binaries on `bookworm` and `buster`,
runs the pytest integration test on both distros, and Playwright UI tests on amd64.
