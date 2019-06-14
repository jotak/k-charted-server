package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

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
	PrometheusURL:   "http://prometheus.istio-system:9090",
	Errorf: func(s string, args ...interface{}) {
		fmt.Printf(s+"\n", args...)
	},
	Tracef: func(s string, args ...interface{}) {
		fmt.Printf(s+"\n", args...)
	},
	PodsLoader: podsLoader,
}

type grouped struct {
	Namespace string   `json:"namespace"`
	Items     []string `json:"items"`
}

func searchLabels(w http.ResponseWriter, r *http.Request) {
	pathParams := mux.Vars(r)
	groupBy := pathParams["groupBy"]

	p8s, err := api.NewClient(api.Config{Address: cfg.PrometheusURL})
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
		if namespace, ok := labelSet["namespace"]; ok {
			if item, ok2 := labelSet[pmod.LabelName(groupBy)]; ok2 {
				groups = addToGroup(groups, string(namespace), string(item))
			}
		}
	}
	respondWithJSON(w, http.StatusOK, groups)
}

func addToGroup(groups []grouped, namespace string, item string) []grouped {
	for i, g := range groups {
		if g.Namespace == namespace {
			for _, other := range g.Items {
				if other == item {
					// Avoid duplicates
					return groups
				}
			}
			groups[i].Items = append(g.Items, item)
			return groups
		}
	}
	return append(groups, grouped{Namespace: namespace, Items: []string{item}})
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
	r.HandleFunc("/groupBy/{groupBy}", searchLabels)
	r.HandleFunc("/namespaces/{namespace}/dashboards", searchDashboards)
	r.HandleFunc("/namespaces/{namespace}/dashboards/{dashboard}", getDashboard)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./web/react/build/")))
	fmt.Println("Server listening on port 8000")
	panic(http.ListenAndServe(":8000", r))
}
