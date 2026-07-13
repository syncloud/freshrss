#!/bin/sh -ex

DIR=$( cd "$( dirname "$0" )" && pwd )
BUILD_DIR=${DIR}/../build/snap

export SNAP_DATA=${DIR}/../build/php-test
mkdir -p ${SNAP_DATA}/config
echo "extension_dir=${BUILD_DIR}/php/lib/php/extensions" > ${SNAP_DATA}/config/php.ini

${BUILD_DIR}/php/bin/php.sh --version
${BUILD_DIR}/php/bin/php-fpm.sh --version

MODS=$(${BUILD_DIR}/php/bin/php.sh -m)
echo "${MODS}"
for ext in pdo_sqlite curl dom mbstring gmp intl zip gd; do
    echo "${MODS}" | grep -qi "^${ext}$" || { echo "missing php extension: ${ext}"; exit 1; }
done
