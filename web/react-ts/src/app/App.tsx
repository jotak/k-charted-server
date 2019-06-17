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

class App extends React.Component<{}, {}> {
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
        toolbar={<Masthead />}
        showNavToggle={false}
      />
    );
    return (
      <Router>
        <Page header={header} sidebar={<Menu/>}>
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
