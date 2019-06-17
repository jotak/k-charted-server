import axios from 'axios';
import React from 'react';
import { PF4Dashboard, DashboardModel } from 'k-charted-react';

type Props = {
  namespace: string,
  labels: string,
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
    this.fetch();
  }

  componentDidUpdate(oldprops: Props) {
    if (this.props.namespace !== oldprops.namespace
        || this.props.labels !== oldprops.labels
        || this.props.dashboardName !== oldprops.dashboardName) {
      this.fetch();
    }
  }

  fetch = () => {
    this.setState({ loading: true });
    axios.get(`/namespaces/${this.props.namespace}/dashboards/${this.props.dashboardName}`, { params: {
      labelsFilters: this.props.labels
    }}).then(rs => {
      this.setState({ dashboard: rs.data, loading: false });
    });
  }

  render() {
  if (this.state.loading) {
    return (<>Loading...</>);
  } else if (this.state.dashboard) {
    return (<PF4Dashboard dashboard={this.state.dashboard} labelValues={new Map()} expandHandler={() => {}} />);
  }
    return (<>Empty</>);
  }
}

export default Dashboard;
