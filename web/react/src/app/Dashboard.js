import axios from 'axios';
import React from 'react';
import { Dashboard as KDashboard } from '@kiali/k-charted-pf3';

class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = { dashboard: null, loading: false };
  }

  componentDidMount = () => {
    this.setState({ loading: true });
    axios.get(`/namespaces/${this.props.namespace}/dashboards/${this.props.dashboard}`, { params: {
      labelsFilters: this.props.labels
    }}).then(rs => {
      this.setState({ dashboard: rs.data, loading: false });
    });
  }

  render() {
  if (this.state.loading) {
    return (<>Loading...</>);
  } else if (this.state.dashboard) {
    return (<KDashboard dashboard={this.state.dashboard} />);
  }
    return (<>Empty</>);
  }
}

export default Dashboard;
