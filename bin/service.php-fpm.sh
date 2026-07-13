#!/bin/bash -e
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )
/bin/rm -f $SNAP_DATA/php-fpm.sock
exec $DIR/php/bin/php-fpm.sh \
  --nodaemonize \
  --fpm-config $SNAP_DATA/config/php-fpm.conf \
  -c $SNAP_DATA/config/php.ini
