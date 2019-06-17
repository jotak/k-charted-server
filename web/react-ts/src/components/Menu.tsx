import axios from 'axios';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Nav, NavExpandable, NavList, NavItem, PageSidebar } from '@patternfly/react-core';

import { TypeAheadInput } from './TypeAheadInput';
import GlobalState from '../state';

type MenuState = {
  activeItem?: string,
  groupBy: string[],
  groups: Group[]
};

type Group = {
  key: string,
  value: string,
  nested: Group[]
};

type MenuItem = {
  name: string,
  path: string
};

const initialGroupBy = ['pod_name'];

export class Menu extends React.Component<{}, MenuState> {
  static contextTypes = {
    router: () => null
  };

  constructor(props: {}) {
    super(props);
    this.state = { groupBy: initialGroupBy, groups: [] };
  }

  componentDidMount = () => {
    this.fetch();
  }

  fetch = () => {
    axios.get(`/groupBy/${this.state.groupBy}`).then(rs => {
      this.setState({ groups: rs.data });
    }).catch(error => {
      // TODO: alert on page
      console.log(error);
    });
  }

  onGroupByChange = (selection: string[]) => {
    this.setState({ groupBy: selection }, this.fetch);
  }

  render() {
    const PageNav = (
      <>
        <div style={{ fontStyle: 'italic', fontWeight: 'bold', paddingLeft: 10 }}>
          <TypeAheadInput title="Group by" values={GlobalState.labels} initial={initialGroupBy} onSelect={this.onGroupByChange} />
        </div>
        <Nav onSelect={item => this.setState({ activeItem: String(item.itemId) })} onToggle={() => {}} aria-label="Nav">
          <NavList>
            {this.state.groups.map(ns => {
              return (
                <NavExpandable title={ns.value} groupId={ns.value} key={ns.value} isActive={this.state.activeItem === ns.value} isExpanded={false}>
                  {ns.nested.map(nested => {
                    const menuItems = this.menuItems(ns.value, nested, []);
                    return menuItems.map(item => {
                      return (
                        <NavItem isActive={this.state.activeItem === item.path} key={item.path} itemId={item.path}>
                          <Link to={`/ns/${ns.value}/l/${item.path}`}>{item.name}</Link>
                        </NavItem>
                      );
                    });
                  })}
                </NavExpandable>
              );
            })}
          </NavList>
        </Nav>
      </>
    );

    return <PageSidebar isNavOpen={true} nav={PageNav} />;
  }

  menuItems(namespace: string, g: Group, kvPath: [string, string][]): MenuItem[] {
    const newPath = kvPath.concat([[g.key, g.value]]);
    if (g.nested) {
      // Not a leaf
      // Flat-map
      return ([] as MenuItem[]).concat.apply([], g.nested.map(nested => this.menuItems(namespace, nested, newPath)));
    }
    // Leaf
    return [{
      name: newPath.map(kv => kv[1]).join('-'),
      path: newPath.map(kv => `${kv[0]}:${kv[1]}`).join(',')
    }];
  }
}
