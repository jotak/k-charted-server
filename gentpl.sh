#!/usr/bin/env bash

PULL_POLICY="Never"
DOMAIN=""
TAG="dev"
LAST_ARG=""

for arg in "$@"
do
    if [[ "$LAST_ARG" = "-pp" ]]; then
        PULL_POLICY="$arg"
        LAST_ARG=""
    elif [[ "$LAST_ARG" = "-d" ]]; then
        DOMAIN="$arg/"
        LAST_ARG=""
    elif [[ "$LAST_ARG" = "-t" ]]; then
        TAG="$arg"
        LAST_ARG=""
    else
        LAST_ARG="$arg"
    fi
done

IMAGE="${DOMAIN}jotak/k-charted-server:$TAG"

cat ./Deployment.yml \
    | yq w - spec.template.spec.containers[0].imagePullPolicy $PULL_POLICY \
    | yq w - spec.template.spec.containers[0].image $IMAGE

echo "---"
