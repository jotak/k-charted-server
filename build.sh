#!/bin/sh

set -e

echo "Building frontend..."
cd web/react-ts
yarn build
cd ../..
echo "Building executable..."
go build
echo "Building docker image..."
docker build -t jotak/k-charted-server .
