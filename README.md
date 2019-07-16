# k-charted-server
A server implementing K-Charted

For a more feature-rich demo, check-out the [explorer](https://github.com/jotak/k-charted-server/tree/explorer) branch.

## Install dependencies

```bash
./prepare.sh
```

## Build

```bash
./build.sh
```

## Deploy (OpenShift)

```bash
./deploy.sh
```

Note, it's currently hard-coded to use Prometheus installed in istio-system.
It's easy to change or make it configurable. Deploy script already supports another namespace with `./deploy.sh mynamespace`.
