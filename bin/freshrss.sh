#!/bin/bash -e
export SNAP=/snap/freshrss/current
export SNAP_DATA=/var/snap/freshrss/current
export SNAP_COMMON=/var/snap/freshrss/common
. $SNAP_DATA/config/env
export HOME=$SNAP_DATA
cd $SNAP/freshrss
exec $SNAP/php/bin/php.sh "$@"
