#!/bin/bash
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )
while true; do
    sleep 900
    if [ -f $SNAP_DATA/config/env ]; then
        $DIR/bin/freshrss.sh ./cli/actualize-script.php || true
    fi
done
