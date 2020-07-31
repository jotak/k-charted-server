import axios from 'axios';
import React from 'react';
import { Tabs, Tab } from '@patternfly/react-core';
import { Runtime } from '@kiali/k-charted-pf4';

import { Toolbar, ToolbarContent } from './Toolbar';
import Dashboard from './Dashboard';

import './App.css';

type State = {
  toolbar: ToolbarContent,
  runtimes: Runtime[]
}

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { toolbar: { namespace: "", labels: "" }, runtimes: [] };
  }

  fetch = (args: ToolbarContent) => {
    if (args.namespace) {
      axios.get(`/namespaces/${args.namespace}/dashboards`, { params: {
        labelsFilters: args.labels
      }}).then(rs => {
        this.setState({ toolbar: args, runtimes: rs.data });
      });
    }
  }

  render() {
    return (
      <>
        <Toolbar init={this.state.toolbar} onSearch={this.fetch}></Toolbar>
        {this.state.runtimes.length > 0 && (
          <Tabs
            id="tabs"
            style={{marginLeft: 7}}
            mountOnEnter={true}
            unmountOnExit={true}
          >
            {this.state.runtimes.map(runtime => {
              return runtime.dashboardRefs.map(ref => {
                return (
                  <Tab
                    key={ref.template}
                    eventKey={ref.template}
                    title={ref.title}
                  >
                    <Dashboard
                      toolbar={this.state.toolbar}
                      dashboardName={ref.template}
                    />
                  </Tab>
                );
              });
            })}
          </Tabs>
        )}
      </>
    );
  }
}

export default App;
