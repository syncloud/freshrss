#!/bin/sh -ex

DIR=$( cd "$( dirname "$0" )" && pwd )
cd ${DIR}

VERSION=$1
if [ -z "${VERSION}" ]; then
    echo "usage $0 version"
    exit 1
fi

BUILD_DIR=${DIR}/../build/snap/freshrss
mkdir -p ${BUILD_DIR}

apt-get update
apt-get install -y --no-install-recommends wget ca-certificates

wget --progress=dot:giga -O freshrss.tar.gz \
    https://github.com/FreshRSS/FreshRSS/archive/refs/tags/${VERSION}.tar.gz
tar xf freshrss.tar.gz --strip-components=1 -C ${BUILD_DIR}
rm -f freshrss.tar.gz
