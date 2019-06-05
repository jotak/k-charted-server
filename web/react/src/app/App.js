import axios from 'axios';
import React from 'react';
import { TabContainer, Nav, NavItem, TabContent, TabPane } from 'patternfly-react';

import Toolbar from './Toolbar';
import Dashboard from './Dashboard';

import './App.css';
// import 'patternfly/dist/css/patternfly.css';
// import 'patternfly-react/dist/css/patternfly-react.css';
// import 'patternfly-react-extensions/dist/css/patternfly-react-extensions.css';

class App extends React.Component {
  constructor() {
    super();
    this.state = { namespace: "", labels: "", runtimes: [] };
  }

  fetch = (args) => {
    if (args && args.namespace) {
      axios.get(`/namespaces/${args.namespace}/dashboards`, { params: {
        labelsFilters: args.labels
      }}).then(rs => {
        this.setState({ namespace: args.namespace, labels: args.labels, runtimes: rs.data });
      });
    }
  }

  render() {
    return (
      <>
        <Toolbar onSearch={this.fetch}></Toolbar>
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
                return runtime.dashboardRefs.map(dashboard => {
                  return (
                    <TabPane
                      key={dashboard.template}
                      eventKey={dashboard.template}
                      mountOnEnter={true}
                      unmountOnExit={true}
                    >
                      <Dashboard
                        namespace={this.state.namespace}
                        labels={this.state.labels}
                        dashboard={dashboard.template}
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
