#!/bin/bash -e
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )
LIBS=$(echo ${DIR}/lib/*-linux-gnu*)
LIBS=$LIBS:$(echo ${DIR}/usr/lib/*-linux-gnu*)
LIBS=$LIBS:${DIR}/usr/lib
export PHP_INI_SCAN_DIR=${DIR}/usr/local/etc/php/conf.d
exec ${DIR}/lib/*-linux-gnu*/ld-*.so* \
  --library-path $LIBS \
  ${DIR}/usr/local/sbin/php-fpm \
  "$@"
