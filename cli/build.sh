#!/bin/bash -e
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd ${DIR}

HOOKS_DIR=${DIR}/../build/snap/meta/hooks
BIN_DIR=${DIR}/../build/snap/bin
mkdir -p ${HOOKS_DIR} ${BIN_DIR}

CGO_ENABLED=0 go build -o ${HOOKS_DIR}/install ./cmd/install
CGO_ENABLED=0 go build -o ${HOOKS_DIR}/configure ./cmd/configure
CGO_ENABLED=0 go build -o ${HOOKS_DIR}/pre-refresh ./cmd/pre-refresh
CGO_ENABLED=0 go build -o ${HOOKS_DIR}/post-refresh ./cmd/post-refresh
CGO_ENABLED=0 go build -o ${BIN_DIR}/cli ./cmd/cli
