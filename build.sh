#!/bin/bash -xe

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

VERSION=${1:-1.29.1}
FRESHRSS_VERSION=${2:-1.29.1}

rm -rf ${DIR}/build

./freshrss/build.sh ${FRESHRSS_VERSION}
./php/build.sh
./nginx/build.sh
./cli/build.sh
./package.sh freshrss ${VERSION}
