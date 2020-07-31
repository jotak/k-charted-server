#!/bin/sh

NAMESPACE="istio-system"
if [[ "$1" != "" ]]; then
  NAMESPACE="$1"
fi

echo "Install CRDs"
kubectl apply -f ./crd.yaml -n $NAMESPACE

echo "Install templates"
for T in $(ls dashboards)
do
    kubectl apply -f $T -n $NAMESPACE
done

sed "s/VAR_NAMESPACE/$NAMESPACE/" Permissions.yml | kubectl apply -n $NAMESPACE -f -
kubectl apply -f ./Deployment.yml -n $NAMESPACE
kubectl apply -f ./Service.yml -n $NAMESPACE

echo "Exposing http://localhost:8000/"
kubectl port-forward svc/k-charted-server 8000:8000 -n istio-system
