import React from 'react';
import { Button, Toolbar as PFToolbar } from 'patternfly-react';

type Props = {
  init: ToolbarContent,
  onSearch: (state: ToolbarContent) => void;
};

export type ToolbarContent = {
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
        Labels <input type="text" onChange={evt => this.setState({ labels: evt.target.value })}/>
        <Button onClick={() => this.props.onSearch(this.state)}>Search</Button>
      </PFToolbar>
    );
  }
}
