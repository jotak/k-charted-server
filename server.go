package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/kiali/k-charted/config"
	"github.com/kiali/k-charted/config/promconfig"
	khttp "github.com/kiali/k-charted/http"
	"github.com/kiali/k-charted/model"
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
	Prometheus:      promconfig.PrometheusConfig{URL: "http://prometheus.istio-system:9090"},
	Errorf: func(s string, args ...interface{}) {
		fmt.Printf(s+"\n", args...)
	},
	Tracef: func(s string, args ...interface{}) {
		fmt.Printf(s+"\n", args...)
	},
	PodsLoader: podsLoader,
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

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/namespaces/{namespace}/dashboards", searchDashboards)
	r.HandleFunc("/namespaces/{namespace}/dashboards/{dashboard}", getDashboard)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./web/react/build/")))
	fmt.Println("Server listening on port 8000")
	panic(http.ListenAndServe(":8000", r))
}
