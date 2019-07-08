#!/bin/sh

NAMESPACE="istio-system"
if [[ "$1" != "" ]]; then
  NAMESPACE="$1"
fi

echo "Install CRDs"
oc apply -f ./crd.yaml -n $NAMESPACE

echo "Install templates"
for T in $(ls dashboards)
do
    oc apply -f $T -n $NAMESPACE
done

sed "s/VAR_NAMESPACE/$NAMESPACE/" Permissions.yml | oc apply -n $NAMESPACE -f -
oc apply -f ./Deployment.yml -n $NAMESPACE
oc apply -f ./Service.yml -n $NAMESPACE

oc expose svc/k-charted-server -n $NAMESPACE
