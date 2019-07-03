package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/kiali/k-charted/config/promconfig"

	"github.com/gorilla/mux"
	"github.com/kiali/k-charted/config"
	khttp "github.com/kiali/k-charted/http"
	"github.com/kiali/k-charted/model"
	"github.com/prometheus/client_golang/api"
	v1 "github.com/prometheus/client_golang/api/prometheus/v1"
	pmod "github.com/prometheus/common/model"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

type Pod struct {
	corev1.Pod
}

func (p Pod) GetAnnotations() map[string]string {
	return p.Annotations
}

var cfg = config.Config{
	GlobalNamespace: "istio-system",
	Prometheus: promconfig.PrometheusConfig{
		URL: "http://prometheus.istio-system:9090",
	},
	Errorf: func(s string, args ...interface{}) {
		fmt.Printf(s+"\n", args...)
	},
	Tracef: func(s string, args ...interface{}) {
		fmt.Printf(s+"\n", args...)
	},
	PodsLoader: podsLoader,
}

type grouped struct {
	Key    string    `json:"key"`
	Value  string    `json:"value"`
	Nested []grouped `json:"nested"`
}

func searchLabels(w http.ResponseWriter, r *http.Request) {
	p8s, err := api.NewClient(api.Config{Address: cfg.Prometheus.URL})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	api := v1.NewAPI(p8s)
	results, err := labelNames(api)
	// results, err := api.LabelNames(context.Background())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, results)
}

// Compatibility function for Prometheus 2.3; else we should use api.LabelNames instead.
func labelNames(api v1.API) ([]string, error) {
	// Arbitrarily set time range. Meaning that discovery works with metrics produced within last hour
	end := time.Now()
	start := end.Add(-time.Hour)
	results, err := api.Series(context.Background(), []string{"up"}, start, end)
	if err != nil {
		return nil, err
	}
	asMap := make(map[string]string)
	for _, labelSet := range results {
		for name, _ := range labelSet {
			// Do not send "namespace" label, as it is necessarily used for grouping anyway
			if name != "namespace" {
				asMap[string(name)] = string(name)
			}
		}
	}
	noDup := []string{}
	for k, _ := range asMap {
		noDup = append(noDup, k)
	}
	return noDup, nil
}

func groupLabelsValues(w http.ResponseWriter, r *http.Request) {
	pathParams := mux.Vars(r)
	rawGroupBy := pathParams["groupBy"]
	groupBy := append([]string{"namespace"}, strings.Split(rawGroupBy, ",")...)

	p8s, err := api.NewClient(api.Config{Address: cfg.Prometheus.URL})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	api := v1.NewAPI(p8s)
	// Arbitrarily set time range. Meaning that discovery works with metrics produced within last hour
	end := time.Now()
	start := end.Add(-time.Hour)
	results, err := api.Series(context.Background(), []string{"up"}, start, end)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	groups := []grouped{}
	for _, labelSet := range results {
		var values []string
		for _, key := range groupBy {
			if value, ok := labelSet[pmod.LabelName(key)]; ok {
				values = append(values, string(value))
			} else {
				// Mission value => ignore item. Alt: we could group all ignored into default category
				break
			}
		}
		if len(values) == len(groupBy) {
			groups = addToGroups(groups, groupBy, values)
		}
	}
	respondWithJSON(w, http.StatusOK, groups)
}

func addToGroups(groups []grouped, keys []string, values []string) []grouped {
	value := values[0]
	for i, g := range groups {
		if g.Value == value {
			if len(values) == 1 {
				// We reached the leaf, and it's already there => do nothing (no duplicate)
				return groups
			}
			// Not yet to leaf => continue down the path
			groups[i].Nested = addToGroups(g.Nested, keys[1:], values[1:])
			return groups
		}
	}
	// Value not found => create new struct and append it
	newGroup := createNewGroup(keys, values)
	return append(groups, newGroup)
}

func createNewGroup(keys []string, values []string) grouped {
	newGroup := grouped{
		Key:   keys[0],
		Value: values[0],
	}
	if len(keys) > 1 {
		newGroup.Nested = []grouped{createNewGroup(keys[1:], values[1:])}
	}
	return newGroup
}

func searchDashboards(w http.ResponseWriter, r *http.Request) {
	khttp.SearchDashboardsHandler(r.URL.Query(), mux.Vars(r), w, cfg)
}

func getDashboard(w http.ResponseWriter, r *http.Request) {
	khttp.DashboardHandler(r.URL.Query(), mux.Vars(r), w, cfg)
}

func podsLoader(namespace, labels string) ([]model.Pod, error) {
	k8sConfig, err := rest.InClusterConfig()
	if err != nil {
		fmt.Printf("%v\n", err)
		return nil, err
	}
	clientset, err := kubernetes.NewForConfig(k8sConfig)
	if err != nil {
		fmt.Printf("%v\n", err)
		return nil, err
	}
	k8sPods, err := clientset.CoreV1().Pods(namespace).List(metav1.ListOptions{LabelSelector: labels})
	if err != nil {
		fmt.Printf("%v\n", err)
		return nil, err
	}
	var pods []model.Pod
	for _, p := range k8sPods.Items {
		pods = append(pods, Pod{p})
	}
	return pods, nil
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		response, _ = json.Marshal(map[string]string{"error": err.Error()})
		code = http.StatusInternalServerError
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_, err = w.Write(response)
	if err != nil {
		cfg.Errorf("could not write response: %v", err)
	}
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/labels", searchLabels)
	r.HandleFunc("/groupBy/{groupBy}", groupLabelsValues)
	r.HandleFunc("/namespaces/{namespace}/dashboards", searchDashboards)
	r.HandleFunc("/namespaces/{namespace}/dashboards/{dashboard}", getDashboard)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./web/react/build/")))
	fmt.Println("Server listening on port 8000")
	panic(http.ListenAndServe(":8000", r))
}
