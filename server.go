package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/kiali/k-charted/config"
	khttp "github.com/kiali/k-charted/http"
	"github.com/kiali/k-charted/model"
)

var cfg = config.Config{
	GlobalNamespace: "istio-system",
	PrometheusURL:   "http://prometheus.istio-system:9090",
	Errorf: func(s string, args ...interface{}) {
		fmt.Printf(s+"\n", args...)
	},
}

func hello(w http.ResponseWriter, r *http.Request) {
	charts := []model.Chart{
		model.Chart{
			Name:   "Test",
			Spans:  6,
			Unit:   "toblerone",
			Metric: []*model.SampleStream{},
		},
	}
	dashboard := model.MonitoringDashboard{
		Title:        "Ma Dashboard",
		Charts:       charts,
		Aggregations: []model.Aggregation{},
	}

	code := 200
	response, err := json.Marshal(dashboard)
	if err != nil {
		response, _ = json.Marshal(map[string]string{"error": err.Error()})
		code = http.StatusInternalServerError
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

func searchDashboards(w http.ResponseWriter, r *http.Request) {
	// params := mux.Vars(r)
	// namespace := params["namespace"]
	// labels := params["labels"]

	// code := 200
	// response, err := json.Marshal(dashboard)
	// if err != nil {
	// 	response, _ = json.Marshal(map[string]string{"error": err.Error()})
	// 	code = http.StatusInternalServerError
	// }

	// w.Header().Set("Content-Type", "application/json")
	// w.WriteHeader(code)
	// w.Write(response)
	w.Write([]byte{})
}

func getDashboard(w http.ResponseWriter, r *http.Request) {
	khttp.DashboardHandler(r.URL.Query(), mux.Vars(r), w, cfg)
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/hello", hello)
	r.HandleFunc("/namespaces/{namespace}/dashboards", searchDashboards)
	r.HandleFunc("/namespaces/{namespace}/dashboards/{dashboard}", getDashboard)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./web/react/build/")))
	fmt.Println("Server listening on port 8000")
	panic(http.ListenAndServe(":8000", r))
}
