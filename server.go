package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/kiali/k-charted/model"
)

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

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/hello", hello)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./web/react/build/")))
	panic(http.ListenAndServe(":8000", r))
}
