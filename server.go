package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	kconf "github.com/kiali/k-charted/config"
	kxconf "github.com/kiali/k-charted/config/extconfig"
	khttp "github.com/kiali/k-charted/http"
	klog "github.com/kiali/k-charted/log"
	"github.com/kiali/k-charted/model"
	kmod "github.com/kiali/k-charted/model"
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

var cfg = kconf.Config{
	GlobalNamespace: "istio-system",
	Prometheus:      kxconf.PrometheusConfig{URL: "http://prometheus.istio-system:9090"},
	PodsLoader:      podsLoader,
}
var logger = klog.LogAdapter{
	Errorf: func(s string, args ...interface{}) {
		fmt.Printf(s+"\n", args...)
	},
	Tracef: func(s string, args ...interface{}) {
		fmt.Printf(s+"\n", args...)
	},
}

func searchDashboards(w http.ResponseWriter, r *http.Request) {
	khttp.SearchDashboardsHandler(r.URL.Query(), mux.Vars(r), w, cfg, logger)
}

func getDashboard(w http.ResponseWriter, r *http.Request) {
	khttp.DashboardHandler(r.URL.Query(), mux.Vars(r), w, cfg, logger)
}

func podsLoader(namespace, labels string) ([]kmod.Pod, error) {
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
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./web/build/")))
	fmt.Println("Server listening on port 8000")
	panic(http.ListenAndServe(":8000", r))
}
