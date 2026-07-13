# FreshRSS for Syncloud

[FreshRSS](https://freshrss.org) packaged as a Syncloud app — a free, self-hostable RSS and Atom feed aggregator.

## Layout

- `snap.yaml` — snap metadata (root, modern shape)
- `freshrss/build.sh` — vendors the upstream FreshRSS release
- `php/` — bundled PHP-FPM runtime (Docker export + `ld-linux` loader wrapper)
- `nginx/` — bundled nginx (unix-socket reverse proxy)
- `cli/` — Go + Cobra installer hooks (`install`, `configure`, refresh, backup/restore)
- `config/` — templated `nginx.conf`, `php-fpm.conf`, `php.ini`, `env`
- `bin/` — service launchers and the FreshRSS CLI wrapper
- `test/` — pytest integration tests

## Storage & auth

- **Database:** SQLite, stored under the Syncloud storage dir via FreshRSS's `DATA_PATH`.
- **Auth:** FreshRSS built-in form login. An `admin` user is provisioned at install; its
  password is written to `<storage>/admin.password`.

FreshRSS's native OIDC support is delegated to Apache `mod_auth_openidc`, which is
incompatible with this nginx + php-fpm stack, so it is not wired up here. Platform SSO
integration is a possible future enhancement (forward-auth / `http_auth`).

## Build

```
./build.sh <package-version> <freshrss-version>
```

Upstream FreshRSS version is pinned as `local version` in `.drone.jsonnet`.
