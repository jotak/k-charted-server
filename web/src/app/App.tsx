import axios from 'axios';
import React from 'react';
import { Tabs, Tab } from '@patternfly/react-core';
import { DashboardRef, Runtime } from '@kiali/k-charted-pf4';

import { Toolbar, ToolbarContent } from './Toolbar';
import Dashboard from './Dashboard';

import './App.css';

type State = {
  toolbar: ToolbarContent,
  dashboards: DashboardRef[],
  activeDashboard?: DashboardRef
}

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { toolbar: { namespace: "", labels: "" }, dashboards: [] };
  }

  fetch = (args: ToolbarContent) => {
    if (args.namespace) {
      axios.get(`/namespaces/${args.namespace}/dashboards`, { params: {
        labelsFilters: args.labels
      }}).then(rs => {
        const flat = (rs.data as Runtime[]).flatMap(r => r.dashboardRefs);
        const first = flat.find(d => d);
        this.setState({ toolbar: args, dashboards: flat, activeDashboard: first });
      });
    }
  }

  render() {
    return (
      <>
        <Toolbar init={this.state.toolbar} onSearch={this.fetch}></Toolbar>
        {this.state.dashboards.length > 0 && (
          <Tabs
            id="tabs"
            activeKey={this.state.activeDashboard?.template}
            onSelect={(_, key) => {
              const selected = this.state.dashboards.find(d => d.template === key);
              if (selected) {
                this.setState({ activeDashboard: selected });
              }
            }}
//            style={{marginLeft: 7}}
            mountOnEnter={true}
            unmountOnExit={true}
          >
            {this.state.dashboards.map(d => {
              return (
                <Tab
                  key={d.template}
                  eventKey={d.template}
                  title={d.title}
                >
                  <Dashboard
                    toolbar={this.state.toolbar}
                    dashboardName={d.template}
                  />
                </Tab>
              );
            })}
          </Tabs>
        )}
      </>
    );
  }
}

export default App;
