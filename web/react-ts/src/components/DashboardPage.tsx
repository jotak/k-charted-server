import axios from 'axios';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import {
  Nav,
  NavItem,
  NavList,
  NavVariants
} from '@patternfly/react-core';
import { Dashboard, DashboardRef, Runtime, DashboardQuery, DashboardModel } from '@kiali/k-charted-pf4';

import { Toolbar } from './Toolbar';
import { AllLabelsValues } from '../types/Labels';

type Props = RouteComponentProps<{
  namespace: string,
  labels: string
}>

type State = {
  dashboards: DashboardRef[],
  selectedDashboardName?: string,
  selectedDashboard?: DashboardModel,
  loading: boolean,
  labelValues: AllLabelsValues
}

export class DashboardPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { loading: false, dashboards: [], labelValues: new Map() };
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(oldprops: Props) {
    if (this.props.match.params.namespace !== oldprops.match.params.namespace
        || this.props.match.params.labels !== oldprops.match.params.labels) {
      this.fetch();
    }
  }

  fetch = () => {
    this.setState({ loading: true });
    const {namespace, labels } = this.props.match.params;
    axios.get(`/namespaces/${namespace}/dashboards`, { params: {
      labelsFilters: labels
    }}).then(rs => {
      const runtimes: Runtime[] = rs.data;
      const dashboards = ([] as DashboardRef[]).concat.apply([], runtimes.map(r => r.dashboardRefs));
      // Keep previous selected if still valid
      let selectedRef = dashboards.map(d => d.template).find(tpl => tpl === this.state.selectedDashboardName);
      if (!selectedRef && dashboards.length > 0) {
        selectedRef = dashboards[0].template;
      }
      this.setState({ dashboards: dashboards, selectedDashboardName: selectedRef, loading: false }, () => {
        if (selectedRef) {
          this.fetchDashboard({});
        }
      });
    });
  }

  fetchDashboard = (options: DashboardQuery) => {
    const {namespace, labels } = this.props.match.params;
    options.labelsFilters = labels;
    axios.get(`/namespaces/${namespace}/dashboards/${this.state.selectedDashboardName}`, { params: options }).then(rs => {
      this.setState({ selectedDashboard: rs.data });
    });
  }

  onSelectDashboard(name: string) {
    this.setState({ selectedDashboardName: name }, () => {
      // TODO: keep whatever option can be kept (duration ...)
      this.fetchDashboard({});
    });
  }

  onLabelsFiltersChanged = (newValues: AllLabelsValues) => {
    this.setState({ labelValues: newValues });
  };

  render() {
    if (this.state.dashboards.length === 0) {
      return (<>No dashboard</>);
    }
    return (
      <>
        <Nav onSelect={selected => this.onSelectDashboard(String(selected.itemId))}>
          <NavList variant={NavVariants.tertiary}>
            {this.state.dashboards.map(dashboard => {
              return (
                <NavItem key={dashboard.template} itemId={dashboard.template} isActive={this.state.selectedDashboardName === dashboard.template}>
                  {dashboard.title}
                </NavItem>
              );
            })}
          </NavList>
        </Nav>
        {this.state.selectedDashboard && (
          <>
            <Toolbar onChange={this.fetchDashboard} onLabelsFiltersChanged={this.onLabelsFiltersChanged}></Toolbar>
            <Dashboard
              dashboard={this.state.selectedDashboard}
              labelValues={this.state.labelValues}
              expandHandler={() => {}}
            />
          </>
        )}
      </>
    );
  }
}
