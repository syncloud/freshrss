#!/bin/bash -e
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )
. $SNAP_DATA/config/env
export HOME=$SNAP_DATA
cd $DIR/freshrss
exec $DIR/php/bin/php.sh "$@"
