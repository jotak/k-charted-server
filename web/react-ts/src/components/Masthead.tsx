import * as React from 'react';
import { Toolbar as ToolbarNext, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';

import { TypeAheadInput } from './TypeAheadInput';
import GlobalState from '../state';

type Props = {
  groupBy: string[],
  onGroupByChange: (selection: string[]) => void;
}

export class Masthead extends React.Component<Props, {}> {
  render() {
    return (
      <ToolbarNext>
        <ToolbarGroup>
          <TypeAheadInput title="Group by" values={GlobalState.labels} initial={this.props.groupBy} onSelect={this.props.onGroupByChange} />
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem>
            K-Charted Explorer
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarNext>
    );
  }
}
