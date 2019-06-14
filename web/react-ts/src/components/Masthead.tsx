import * as React from 'react';
import { Toolbar as ToolbarNext, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { Spinner } from 'patternfly-react';

export class Masthead extends React.Component<{}, {}> {
  render() {
    return (
      <ToolbarNext>
        <ToolbarGroup>
          <Spinner />
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
