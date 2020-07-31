#!/bin/sh

set -e

echo "Installing frontend dependencies..."
cd web
yarn
cd ..
echo "Installing backend dependencies..."
glide update --strip-vendor
