import axios from 'axios';
import React from 'react';

import Toolbar from './Toolbar';
import Panes from './Panes';

import './App.css';
import 'patternfly/dist/css/patternfly.css';
import 'patternfly-react/dist/css/patternfly-react.css';

class App extends React.Component {
  constructor() {
    super();
    this.state = { dashboards: "" };
  }

  fetch = (args) => {
    if (args && args.namespace) {
      const filters = [];
      const additionalLabels = [];
      if (args.app) {
        filters.push({app: args.app});
      } else {
        additionalLabels.push({app: "App"});
      }
      if (args.version) {
        filters.push({version: args.version});
      } else {
        additionalLabels.push({version: "Version"});
      }
      axios.get(`/namespaces/${args.namespace}/dashboards/vertx-client`).then(rs => {
        this.setState({ dashboards: rs.data });
      });
    }
  }

  render() {
    return (
      <>
        <Toolbar onSearch={this.fetch}></Toolbar>
        <Panes dashboard={this.state.dashboards}></Panes>
      </>
    );
  }
}

export default App;
