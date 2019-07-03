import React from 'react';
import { Toolbar as PFToolbar } from '@patternfly/react-core';
import { LabelDisplayName, DashboardQuery, Aggregator, AggregationModel } from '@kiali/k-charted-pf4';
import { MetricsSettingsPanel, Quantiles } from './MetricsSettingsPanel';
import { MetricsRawAggregation } from './MetricsRawAggregation';
import { AllLabelsValues } from '../types/Labels';

type Props = {
  onChange: (options: DashboardQuery) => void;
  onLabelsFiltersChanged: (newValues: AllLabelsValues) => void;
  aggregations?: AggregationModel[];
};

export type State = {};

export class Toolbar extends React.Component<Props, State> {
  options: DashboardQuery;

  constructor(props: Props) {
    super(props);
    this.options = {};
  }

  onHistogramQuantilesChanged = (showQuantiles: Quantiles[]) => {
    this.options.quantiles = showQuantiles;
    this.props.onChange(this.options);
  };

  onHistogramAverageChanged = (avg: boolean) => {
    this.options.avg = avg;
    this.props.onChange(this.options);
  };

  onGroupingChanged = (labels: LabelDisplayName[]) => {
    this.options.byLabels = [];
    if (this.props.aggregations) {
      labels.forEach(lbl => {
        const agg = this.props.aggregations!.find(a => a.displayName === lbl);
        if (agg) {
          this.options.byLabels!.push(agg.label);
        }
      });
    }
    this.props.onChange(this.options);
  }

  onDurationChanged = (duration: number) => {
    // MetricsHelper.durationToOptions(duration, this.options);
    // this.fetchMetrics();
  };

  onRawAggregationChanged = (aggregator: Aggregator) => {
    this.options.rawDataAggregator = aggregator;
    console.log(this.options);
    this.props.onChange(this.options);
  };

  render() {
    // const hasHistograms =
    //   this.state.dashboard !== undefined &&
    //   this.state.dashboard.charts.some(chart => {
    //     if (chart.histogram) {
    //       return Object.keys(chart.histogram).length > 0;
    //     }
    //     return false;
    //   });
    return (
      <PFToolbar>
        <MetricsSettingsPanel
          onGroupingChanged={this.onGroupingChanged}
          onHistogramAverageChanged={this.onHistogramAverageChanged}
          onHistogramQuantilesChanged={this.onHistogramQuantilesChanged}
          onLabelsFiltersChanged={this.props.onLabelsFiltersChanged}
          hasHistograms={true}
        />
        <MetricsRawAggregation onChanged={this.onRawAggregationChanged} />
        {/* <ToolbarRightContent>
          <MetricsDuration onChanged={this.onDurationChanged} />
          <RefreshContainer id="metrics-refresh" handleRefresh={this.fetchMetrics} hideLabel={true} />
        </ToolbarRightContent> */}
      </PFToolbar>
    );
  }
}
