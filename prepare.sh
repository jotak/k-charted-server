#!/bin/sh

set -e

echo "Installing frontend dependencies..."
cd web/react
yarn install
cd ../..
echo "Installing backend dependencies..."
glide update --strip-vendor
