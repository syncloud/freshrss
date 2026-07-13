#!/bin/sh -xe

DIR=$( cd "$( dirname "$0" )" && pwd )
cd ${DIR}

BUILD_DIR=${DIR}/../build/snap/php
mkdir -p ${BUILD_DIR}

apt-get update
apt-get install -y --no-install-recommends \
    libgmp-dev \
    libicu-dev \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev

docker-php-ext-configure gd --with-freetype --with-jpeg
docker-php-ext-install -j"$(nproc)" \
    gmp \
    intl \
    zip \
    gd \
    exif \
    opcache

cp -r /usr ${BUILD_DIR}
cp -r /lib ${BUILD_DIR}
cp -r /bin ${BUILD_DIR}

mkdir -p ${BUILD_DIR}/lib/php/extensions
mv ${BUILD_DIR}/usr/local/lib/php/extensions/*/*.so ${BUILD_DIR}/lib/php/extensions
cp ${DIR}/bin/php.sh ${BUILD_DIR}/bin
cp ${DIR}/bin/php-fpm.sh ${BUILD_DIR}/bin
rm -rf ${BUILD_DIR}/usr/src
