import axios from 'axios';
import * as React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Brand, Page, PageHeader, PageSection } from '@patternfly/react-core';

import GlobalState from '../state';
import { Masthead } from '../components/Masthead';
import { Menu } from '../components/Menu';
import { GettingStarted } from '../components/GettingStarted';
import { DashboardPage } from '../components/DashboardPage';

import './App.css';

const initialGroupBy = ['pod_name'];

type State = {
  groupBy: string[]
}

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    let groupBy = initialGroupBy;
    // Regexp to extract labels used. E.g. extract "app" from "/ns/bookinfo-runtimes/l/app:ratings"
    const labelsFromURL = /\/l\/([^/#]*)/.exec(window.location.pathname);
    if (labelsFromURL && labelsFromURL.length > 1) {
      groupBy = [];
      labelsFromURL[1].split(',').forEach(strkv => {
        const kv = strkv.split(':');
        groupBy.push(kv[0]);
      });
    }
    this.state = { groupBy: groupBy };
  }

  componentDidMount() {
    axios.get('/labels').then(rs => {
      GlobalState.labels = rs.data;
      this.forceUpdate();
    }).catch(error => {
      // TODO: alert on page
      console.log(error);
    });
  }

  render() {
    const header = (
      <PageHeader
        logo={<Brand alt="K-Charted Explorer" />}
        toolbar={<Masthead groupBy={this.state.groupBy} onGroupByChange={gby => this.setState({ groupBy: gby })} />}
        showNavToggle={false}
      />
    );
    return (
      <Router>
        <Page header={header} sidebar={<Menu groupBy={this.state.groupBy} />}>
          <PageSection variant={'light'}>
            <div className="container-fluid">
              <Route path="/ns/:namespace/l/:labels" component={DashboardPage} />
              <Route exact path="/" component={GettingStarted} />
            </div>
          </PageSection>
        </Page>
      </Router>
    );
  }
}

export default App;
