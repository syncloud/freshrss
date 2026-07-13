#!/bin/sh -xe

DIR=$( cd "$( dirname "$0" )" && pwd )
cd ${DIR}

BUILD_DIR=${DIR}/../build/snap/php

docker ps -a -q --filter ancestor=freshrss-php:syncloud --format="{{.ID}}" | xargs -r docker stop | xargs -r docker rm || true
docker rmi freshrss-php:syncloud || true
docker build -t freshrss-php:syncloud .
docker create --name=freshrss-php freshrss-php:syncloud

mkdir -p ${BUILD_DIR}
cd ${BUILD_DIR}
docker export freshrss-php -o php.tar
tar xf php.tar
rm -rf php.tar
docker rm freshrss-php

mkdir -p ${BUILD_DIR}/lib/php/extensions
mv ${BUILD_DIR}/usr/local/lib/php/extensions/*/*.so ${BUILD_DIR}/lib/php/extensions
cp ${DIR}/bin/php.sh ${BUILD_DIR}/bin
cp ${DIR}/bin/php-fpm.sh ${BUILD_DIR}/bin
rm -rf ${BUILD_DIR}/usr/src
