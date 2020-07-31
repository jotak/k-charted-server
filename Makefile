# OCI CLI (docker or podman)
OCI_BIN ?= $(shell which podman 2>/dev/null || which docker 2>/dev/null)
OCI_BIN_SHORT = $(shell if [[ ${OCI_BIN} == *"podman" ]]; then echo "podman"; else echo "docker"; fi)
# Tag for docker images
OCI_TAG ?= dev
# Set QUAY=true if you want to use remote (quay.io) images
QUAY ?= false
NAMESPACE ?= istio-system

ifeq ($(QUAY),true)
OCI_DOMAIN ?= quay.io
OCI_DOMAIN_IN_CLUSTER ?= quay.io
PULL_POLICY ?= "IfNotPresent"
else ifeq ($(OCI_BIN_SHORT),podman)
OCI_DOMAIN ?= "$(shell minikube ip):5000"
OCI_DOMAIN_IN_CLUSTER ?= localhost:5000
PULL_POLICY ?= "Always"
else
OCI_DOMAIN ?= ""
OCI_DOMAIN_IN_CLUSTER ?= ""
PULL_POLICY ?= "Never"
endif

.ensure-yq:
	@command -v yq >/dev/null 2>&1 || { echo >&2 "yq is required. Grab it on https://github.com/mikefarah/yq"; exit 1; }

prepare: prepare-js prepare-go

prepare-js:
	@echo "Installing frontend dependencies..."
	cd web && yarn

prepare-go:
	@echo "Installing backend dependencies..."
	glide update --strip-vendor

build: build-js build-go build-container

build-js:
	@echo "Building frontend..."
	cd web && yarn build

build-go:
	@echo "Building backend..."
	go build

build-container:
	@echo "Building container..."
	${OCI_BIN_SHORT} build -t ${OCI_DOMAIN}/jotak/k-charted-server:${OCI_TAG} .
ifneq ($(OCI_DOMAIN_IN_CLUSTER),)
	${OCI_BIN_SHORT} tag ${OCI_DOMAIN}/jotak/k-charted-server:${OCI_TAG} ${OCI_DOMAIN_IN_CLUSTER}/jotak/k-charted-server:${OCI_TAG}
endif
ifeq ($(OCI_BIN_SHORT),podman)
	${OCI_BIN_SHORT} push --tls-verify=false ${OCI_DOMAIN}/jotak/k-charted-server:${OCI_TAG}
else
	${OCI_BIN_SHORT} push ${OCI_DOMAIN}/jotak/k-charted-server:${OCI_TAG}
endif

deploy: .ensure-yq
	./gentpl.sh -pp ${PULL_POLICY} -d "${OCI_DOMAIN_IN_CLUSTER}" -t ${OCI_TAG} | kubectl -n ${NAMESPACE} apply -f -

expose:
	@echo "URL: http://localhost:8000/"
	kubectl -n ${NAMESPACE} port-forward svc/k-charted-server 8000:8000
