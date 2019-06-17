import React from 'react';

export class GettingStarted extends React.Component<{}, {}> {
  render() {
    return (
      <div>
        <h2>K-Charted Explorer</h2>
        <div>
          K-Charted Explorer is a tool to explore Prometheus metrics within a Kubernetes cluster.
        </div>
        <div>
          From the left menu, enter any Prometheus label that is used in the metrics to group entities based on it.
        </div>
        <div>
          Then select an entity and navigate through the corresponding charts.
        </div>
      </div>
    );
  }
}
