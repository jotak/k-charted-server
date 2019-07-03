import * as React from 'react';
import { Aggregator } from '@kiali/k-charted-pf4';

import { ToolbarDropdown } from './ToolbarDropdown';

interface Props {
  onChanged: (aggregator: Aggregator) => void;
}

export class MetricsRawAggregation extends React.Component<Props> {
  static Aggregators: [Aggregator, string][] = [
    ['sum', 'Sum'],
    ['avg', 'Average'],
    ['min', 'Min'],
    ['max', 'Max'],
    ['stddev', 'Standard deviation'],
    ['stdvar', 'Standard variance']
  ];

  private aggregator: Aggregator;

  constructor(props: Props) {
    super(props);
    this.aggregator = 'sum';
  }

  onAggregatorChanged = (aggregator: string) => {
    this.aggregator = aggregator as Aggregator;
    this.props.onChanged(this.aggregator);
  };

  render() {
    return (
      <ToolbarDropdown
        id={'metrics_filter_aggregator'}
        initial={this.aggregator}
        label={'Pods aggregation'}
        handleSelect={this.onAggregatorChanged}
        options={MetricsRawAggregation.Aggregators}
      />
    );
  }
}
