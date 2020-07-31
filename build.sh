#!/bin/sh

set -e

echo "Building frontend..."
cd web
yarn build
cd ..
echo "Building executable..."
go build
echo "Building container image..."
podman build -t jotak/k-charted-server .
