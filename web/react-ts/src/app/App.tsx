import axios from 'axios';
import React from 'react';
import { TabContainer, Nav, NavItem, TabContent, TabPane } from 'patternfly-react';
import { Runtime } from 'k-charted-react';

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
        <TabContainer id="tabs" style={{marginLeft: 7}}>
          <div>
            <Nav bsClass="nav nav-tabs nav-tabs-pf">
              {this.state.runtimes.map(runtime => {
                return runtime.dashboardRefs.map(dashboard => {
                  return (
                    <NavItem key={dashboard.template} eventKey={dashboard.template}>
                      {dashboard.title}
                    </NavItem>
                  );
                });
              })}
            </Nav>
            <TabContent>
              {this.state.runtimes.map(runtime => {
                return runtime.dashboardRefs.map(ref => {
                  return (
                    <TabPane
                      key={ref.template}
                      eventKey={ref.template}
                      mountOnEnter={true}
                      unmountOnExit={true}
                    >
                      <Dashboard
                        toolbar={this.state.toolbar}
                        dashboardName={ref.template}
                      />
                    </TabPane>
                  );
                });
              })}
            </TabContent>
          </div>
        </TabContainer>
      </>
    );
  }
}

export default App;
