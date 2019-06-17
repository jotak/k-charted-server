import axios from 'axios';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  Nav,
  NavItem,
  NavList,
  NavVariants
} from '@patternfly/react-core';
import { DashboardRef, Runtime } from 'k-charted-react';

import { Toolbar, ToolbarContent } from './Toolbar';
import Dashboard from './Dashboard';

type Props = RouteComponentProps<{
  namespace: string,
  labels: string
}>

type State = {
  toolbar: ToolbarContent,
  dashboards: DashboardRef[],
  selectedDashboard?: string
}

export class DashboardPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { toolbar: { labels: "" }, dashboards: [] };
  }

  componentDidMount() {
    this.fetch({});
  }

  componentDidUpdate(oldprops: Props) {
    if (this.props.match.params.namespace !== oldprops.match.params.namespace
        || this.props.match.params.labels !== oldprops.match.params.labels) {
      this.fetch({});
    }
  }

  fetch = (args: ToolbarContent) => {
    const {namespace, labels } = this.props.match.params;
    axios.get(`/namespaces/${namespace}/dashboards`, { params: {
      labelsFilters: labels
    }}).then(rs => {
      const runtimes: Runtime[] = rs.data;
      const dashboards = ([] as DashboardRef[]).concat.apply([], runtimes.map(r => r.dashboardRefs));
      this.setState({ toolbar: args, dashboards: dashboards, selectedDashboard: dashboards.length > 0 ? dashboards[0].template : undefined });
    });
  }

  render() {
    if (this.state.dashboards.length === 0) {
      return (<>No dashboard</>);
    }
    const {namespace, labels } = this.props.match.params;
    return (
      <>
        <Nav onSelect={selected => this.setState({ selectedDashboard: String(selected.itemId) })}>
          <NavList variant={NavVariants.tertiary}>
            {this.state.dashboards.map(dashboard => {
              return (
                <NavItem key={dashboard.template} itemId={dashboard.template} isActive={this.state.selectedDashboard === dashboard.template}>
                  {dashboard.title}
                </NavItem>
              );
            })}
          </NavList>
        </Nav>
        {this.state.selectedDashboard && (
          <>
            <Toolbar init={this.state.toolbar} onSearch={this.fetch}></Toolbar>
            <Dashboard
              namespace={namespace}
              labels={labels}
              dashboardName={this.state.selectedDashboard}
            />
          </>
        )}
      </>
    );
  }
}
