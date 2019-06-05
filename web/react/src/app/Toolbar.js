import React from 'react';
import { Button, Toolbar as PFToolbar } from 'patternfly-react';

class Toolbar extends React.Component {
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

export default Toolbar;
