#!/bin/sh

echo "Building executable..."
go build
echo "Building docker image..."
docker build -t jotak/k-charted-server .
