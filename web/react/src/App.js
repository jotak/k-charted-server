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
    axios.get("/hello").then(rs => {
      this.setState({ dashboards: rs.data });
    });
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
