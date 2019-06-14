import axios from 'axios';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Nav, NavExpandable, NavList, NavItem, PageSidebar } from '@patternfly/react-core';

type MenuState = {
  activeItem?: string,
  groupBy: string,
  groups: Group[]
};

type Group = {
  namespace: string,
  items: string[]
};

export class Menu extends React.Component<{}, MenuState> {
  static contextTypes = {
    router: () => null
  };

  constructor(props: {}) {
    super(props);
    this.state = { groupBy: 'pod_name', groups: [] };
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

  render() {
    const PageNav = (
      <>
        <div style={{ fontStyle: 'italic', fontWeight: 'bold', paddingLeft: 10 }}>
          Group by&nbsp;
          <input type="text" value={this.state.groupBy} onChange={evt => this.setState({ groupBy: evt.target.value }, this.fetch)} style={{ width: 150 }}/>
        </div>
        <Nav onSelect={item => this.setState({ activeItem: String(item.itemId) })} onToggle={() => {}} aria-label="Nav">
          <NavList>
            {this.state.groups.map(g => {
              return (
                <NavExpandable title={g.namespace} groupId={g.namespace} isActive={this.state.activeItem !== undefined && this.state.activeItem.startsWith(g.namespace + '/')} isExpanded={false}>
                  {g.items.map(item => {
                    const id = `${g.namespace}/${item}`;
                    return (
                      <NavItem isActive={this.state.activeItem === id} key={id} itemId={id}>
                        <Link to={`/ns/${g.namespace}/${this.state.groupBy}/${item}`}>{item}</Link>
                      </NavItem>
                    );
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
}
