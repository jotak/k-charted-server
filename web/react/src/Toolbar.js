import React from 'react';
import { Button, Toolbar as PFToolbar } from 'patternfly-react';

// import 'patternfly/dist/css/patternfly.css';
// import 'patternfly-react/dist/css/patternfly-react.css';

class Toolbar extends React.Component {
  render() {
    return (
      <PFToolbar>
        Namespace <input type="text" onChange={evt => this.setState({ namespace: evt.target.value })}/>
        App <input type="text" onChange={evt => this.setState({ app: evt.target.value })}/>
        Version <input type="text" onChange={evt => this.setState({ version: evt.target.value })}/>
        <Button onClick={() => this.props.onSearch(this.state)}>Search</Button>
      </PFToolbar>
    );
  }
}

export default Toolbar;
