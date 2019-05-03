import React from 'react';
import { PF3Dashboard } from 'k-charted-react';

function Panes(props) {
  if (props.dashboard) {
    return (<PF3Dashboard dashboard={props.dashboard} />)
  }
  return (<>Empty</>
  );
}

export default Panes;
