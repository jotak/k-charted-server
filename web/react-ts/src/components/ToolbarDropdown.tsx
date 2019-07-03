import * as React from 'react';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core';

type Props<K> = {
  id?: string;
  label?: string;
  options: [K, string][];
  initial?: K;
  handleSelect: (value: K) => void;
};

type State<K> = {
  isOpen: boolean;
  selected?: K;
};

export class ToolbarDropdown<K> extends React.Component<Props<K>, State<K>> {
  constructor(props: Props<K>) {
    super(props);
    this.state = {
      isOpen: false,
      selected: props.initial
    };
  }

  onKeyChanged = (event: any) => {
    const key = event.target.id;
    this.setState({ selected: key, isOpen: false });
    this.props.handleSelect(key);
  };

  render() {
    const selectedKeyAndName = this.props.options.find(opt => opt[0] === this.state.selected);
    const selectedName = selectedKeyAndName ? selectedKeyAndName[1] : undefined;
    return (
      <>
        {this.props.label && <label style={{ paddingRight: '0.5em' }}>{this.props.label}</label>}
        <Dropdown
          id={this.props.id}
          toggle={<DropdownToggle onToggle={(isOpen: boolean) => this.setState({ isOpen: isOpen })}>{selectedName}</DropdownToggle>}
          onSelect={this.onKeyChanged}
          isOpen={this.state.isOpen}
          dropdownItems={
            this.props.options.map(opt => {
              return (<DropdownItem id={String(opt[0])}>{opt[1]}</DropdownItem>);
            })
          }
        />
      </>
    );
  }
}

export default ToolbarDropdown;
