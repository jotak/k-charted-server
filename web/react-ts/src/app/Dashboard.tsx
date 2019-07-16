import axios from 'axios';
import React from 'react';
import { Dashboard as KDashboard, DashboardModel } from '@kiali/k-charted-pf3';
import { ToolbarContent } from './Toolbar';

type Props = {
  toolbar: ToolbarContent,
  dashboardName: string
};

type State = {
  dashboard?: DashboardModel,
  loading: boolean
};

class Dashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { loading: false };
  }

  componentDidMount = () => {
    this.setState({ loading: true });
    axios.get(`/namespaces/${this.props.toolbar.namespace}/dashboards/${this.props.dashboardName}`, { params: {
      labelsFilters: this.props.toolbar.labels
    }}).then(rs => {
      this.setState({ dashboard: rs.data, loading: false });
    });
  }

  render() {
    if (this.state.loading) {
      return (<>Loading ...</>);
    } else if (this.state.dashboard) {
      return (<KDashboard dashboard={this.state.dashboard} labelValues={new Map()} expandHandler={() => {}} />);
    }
    return (<>Empty</>);
  }
}

export default Dashboard;
