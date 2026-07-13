local name = 'freshrss';
local version = '1.29.1';
local go = '1.25';
local nginx = '1.29.3-alpine3.22';
local python = '3.12-slim-bookworm';
local publisher_image = 'syncloud/store-publisher:stable-291';
local platform = '26.04.10';
local dind = '27-dind';
local distros = ['bookworm', 'buster'];
local distro_default = 'bookworm';
local arch = 'amd64';

local platform_image(distro) =
  'syncloud/platform-' + distro + '-' + arch + ':' + platform;

[{
  kind: 'pipeline',
  type: 'docker',
  name: arch,
  platform: {
    os: 'linux',
    arch: arch,
  },
  steps: [
    {
      name: 'version',
      image: 'debian:bookworm-slim',
      commands: [
        'echo $DRONE_BUILD_NUMBER > version',
      ],
    },
    {
      name: 'freshrss',
      image: 'debian:bookworm-slim',
      commands: [
        'apt update && apt install -y wget',
        './freshrss/build.sh ' + version,
      ],
    },
    {
      name: 'php',
      image: 'docker:' + dind,
      commands: [
        './php/build.sh',
      ],
      volumes: [
        { name: 'dockersock', path: '/var/run' },
      ],
    },
    {
      name: 'nginx',
      image: 'nginx:' + nginx,
      commands: [
        './nginx/build.sh',
      ],
    },
  ] + [
    {
      name: 'nginx test ' + distro,
      image: platform_image(distro),
      commands: ['./nginx/test.sh'],
    }
    for distro in distros
  ] + [
    {
      name: 'cli',
      image: 'golang:' + go,
      commands: [
        './cli/build.sh',
      ],
    },
    {
      name: 'package',
      image: 'debian:bookworm-slim',
      commands: [
        'VERSION=$(cat version)',
        './package.sh ' + name + ' $VERSION',
      ],
    },
    {
      name: 'test ' + distro_default,
      image: 'python:' + python,
      commands: [
        'DOMAIN="' + distro_default + '.com"',
        'APP_DOMAIN="' + name + '.' + distro_default + '.com"',
        'getent hosts $APP_DOMAIN | sed "s/$APP_DOMAIN/auth.$DOMAIN/g" | tee -a /etc/hosts',
        'cat /etc/hosts',
        'APP_ARCHIVE_PATH=$(realpath $(cat package.name))',
        'cd test',
        './deps.sh',
        'py.test -x -s test.py --distro=' + distro_default + ' --app-archive-path=$APP_ARCHIVE_PATH --app=' + name + ' --arch=' + arch,
      ],
    },
    {
      name: 'publish',
      image: publisher_image,
      environment: {
        SYNCLOUD_TOKEN: { from_secret: 'syncloud_token' },
      },
      command: ['snap', '-c', '${DRONE_BRANCH}'],
      when: {
        branch: ['master', 'stable'],
        event: ['push'],
      },
    },
    {
      name: 'artifact',
      image: 'appleboy/drone-scp:1.6.4',
      settings: {
        host: { from_secret: 'artifact_host' },
        username: 'artifact',
        key: { from_secret: 'artifact_key' },
        timeout: '2m',
        command_timeout: '2m',
        target: '/home/artifact/repo/' + name + '/${DRONE_BUILD_NUMBER}-' + arch,
        source: 'artifact/*',
        strip_components: 1,
      },
      when: {
        status: ['failure', 'success'],
        event: ['push'],
      },
    },
  ],
  trigger: {
    event: ['push'],
  },
  services: [
    {
      name: 'docker',
      image: 'docker:' + dind,
      privileged: true,
      volumes: [
        { name: 'dockersock', path: '/var/run' },
      ],
    },
    {
      name: name + '.' + distro_default + '.com',
      image: platform_image(distro_default),
      privileged: true,
      volumes: [
        { name: 'dbus', path: '/var/run/dbus' },
        { name: 'dev', path: '/dev' },
      ],
    },
  ],
  volumes: [
    { name: 'dbus', host: { path: '/var/run/dbus' } },
    { name: 'dev', host: { path: '/dev' } },
    { name: 'dockersock', temp: {} },
  ],
}]
