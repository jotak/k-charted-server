import axios from 'axios';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Nav, NavList, NavItem, PageSidebar } from '@patternfly/react-core';

type MenuState = {
  activeItem?: string;
  namespaces: string[];
};

const defaultGroupBy = 'pod_name';

export class Menu extends React.Component<{}, MenuState> {
  static contextTypes = {
    router: () => null
  };

  constructor(props: {}) {
    super(props);
    this.state = { namespaces: [] };
  }

  componentDidMount = () => {
    this.fetchNamespaces();
  }

  fetchNamespaces = () => {
    axios.get(`/namespaces`).then(rs => {
      this.setState({ namespaces: rs.data });
    }).catch(error => {
      this.setState({ namespaces: ['ns1', 'ns2', 'bookinfo-runtimes', 'istio-system'] });
    });
  }

  render() {
    const PageNav = (
      <>
        <div style={{ fontStyle: 'italic', fontWeight: 'bold', paddingLeft: 10 }}>
          Group by&nbsp;
          <input type="text" value={defaultGroupBy} onChange={evt => {}} style={{ width: 150 }}/>
        </div>
        <Nav onSelect={item => this.setState({ activeItem: String(item.itemId) })} onToggle={() => {}} aria-label="Nav">
          <NavList>
            <NavItem>
            </NavItem>
            {this.state.namespaces.map(ns => {
              return (
                <NavItem isActive={this.state.activeItem === ns} key={ns} itemId={ns}>
                  <Link to={`/ns/${ns}`}>{ns}</Link>
                </NavItem>
              );
            })}
          </NavList>
        </Nav>
      </>
    );

    return <PageSidebar isNavOpen={true} nav={PageNav} />;
  }
}
