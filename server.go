package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/kiali/k-charted/config"
	khttp "github.com/kiali/k-charted/http"
)

var cfg = config.Config{
	GlobalNamespace: "istio-system",
	PrometheusURL:   "http://prometheus.istio-system:9090",
	Errorf: func(s string, args ...interface{}) {
		fmt.Printf(s+"\n", args...)
	},
	Tracef: func(s string, args ...interface{}) {
		fmt.Printf(s+"\n", args...)
	},
}

func searchDashboards(w http.ResponseWriter, r *http.Request) {
	// TODO
	w.Write([]byte{})
}

func getDashboard(w http.ResponseWriter, r *http.Request) {
	khttp.DashboardHandler(r.URL.Query(), mux.Vars(r), w, cfg)
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/namespaces/{namespace}/dashboards", searchDashboards)
	r.HandleFunc("/namespaces/{namespace}/dashboards/{dashboard}", getDashboard)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./web/react/build/")))
	fmt.Println("Server listening on port 8000")
	panic(http.ListenAndServe(":8000", r))
}
