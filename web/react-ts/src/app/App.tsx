import * as React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Brand, Page, PageHeader, PageSection } from '@patternfly/react-core';

import { Masthead } from '../components/Masthead';
import { Menu } from '../components/Menu';
import { MainContainer } from '../components/MainContainer';

import './App.css';

class App extends React.Component<{}, {}> {
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
              <Route exact path="/" component={MainContainer} />
              <Route path="/ns/:namespace" component={MainContainer} />
            </div>
          </PageSection>
        </Page>
      </Router>
    );
  }
}

export default App;
