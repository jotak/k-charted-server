import axios from 'axios';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { TabContainer, Nav, NavItem, TabContent, TabPane } from 'patternfly-react';
import { Runtime } from 'k-charted-react';

import { Toolbar, ToolbarContent } from './Toolbar';
import Dashboard from './Dashboard';

type Props = RouteComponentProps<{
  namespace: string
}>

type State = {
  toolbar: ToolbarContent,
  runtimes: Runtime[]
}

export class MainContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { toolbar: { labels: "" }, runtimes: [] };
  }

  fetch = (args: ToolbarContent) => {
    if (this.props.match.params.namespace) {
      axios.get(`/namespaces/${this.props.match.params.namespace}/dashboards`, { params: {
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
                        namespace={this.props.match.params.namespace}
                        labels={this.state.toolbar.labels}
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
