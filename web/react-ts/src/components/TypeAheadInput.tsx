import React from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

type Props = {
  title: string;
  values: string[];
  initial: string[];
  onSelect: (selected: string[]) => void;
}

type State = {
  isExpanded: boolean;
  selected: string[];
}

export class TypeAheadInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isExpanded: false, selected: props.initial };
  }

  onToggle = (isExpanded: boolean) => {
    this.setState({ isExpanded });
  };

  onSelect = (event: any, selection: string) => {
    const selected = (this.state.selected.includes(selection))
      ? this.state.selected.filter(item => item !== selection)
      : [...this.state.selected, selection];
    this.setState({ selected: selected });
    this.props.onSelect(selected);
  };

  clearSelection = () => {
    this.setState({ selected: [] });
    this.props.onSelect([]);
  };

  render() {
    const { isExpanded, selected } = this.state;
    const titleId = 'multi-typeahead-select-id';

    return (
      <div>
        <span id={titleId} hidden>
          Select a state
        </span>
        <Select
          variant={SelectVariant.typeaheadMulti}
          aria-label={this.props.title}
          onToggle={this.onToggle}
          onSelect={this.onSelect}
          onClear={this.clearSelection}
          selections={selected}
          isExpanded={isExpanded}
          ariaLabelledBy={titleId}
          placeholderText={this.props.title}
        >
          {this.props.values.map((option, index) => (
            <SelectOption key={index} value={option} />
          ))}
        </Select>
      </div>
    );
  }
}
