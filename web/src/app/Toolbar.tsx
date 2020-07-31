import React from 'react';
import { Button, Toolbar as PFToolbar } from '@patternfly/react-core';

type Props = {
  init: ToolbarContent,
  onSearch: (state: ToolbarContent) => void;
};

export type ToolbarContent = {
  namespace: string,
  labels: string
};

export class Toolbar extends React.Component<Props, ToolbarContent> {
  constructor(props: Props) {
    super(props);
    this.state = props.init;
  }

  render() {
    return (
      <PFToolbar>
        Namespace <input type="text" onChange={evt => this.setState({ namespace: evt.target.value })}/>
        Labels <input type="text" onChange={evt => this.setState({ labels: evt.target.value })}/>
        <Button onClick={() => this.props.onSearch(this.state)}>Search</Button>
      </PFToolbar>
    );
  }
}
