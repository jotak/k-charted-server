import * as React from 'react';
import assign from 'lodash/fp/assign';
import { style } from 'typestyle';
import { LabelDisplayName } from '@kiali/k-charted-pf4';

import { AllLabelsValues } from '../types/Labels';

export type Quantiles = '0.5' | '0.95' | '0.99' | '0.999';
const allQuantiles: Quantiles[] = ['0.5', '0.95', '0.99', '0.999'];

interface Props {
  onHistogramQuantilesChanged: (showQuantiles: Quantiles[]) => void;
  onHistogramAverageChanged: (avg: boolean) => void;
  onGroupingChanged: (labels: LabelDisplayName[]) => void;
  onLabelsFiltersChanged: (newValues: AllLabelsValues) => void;
  hasHistograms: boolean;
}

type State = {
  activeLabels: LabelDisplayName[];
  showAverage: boolean;
  showQuantiles: Quantiles[];
  labelValues: AllLabelsValues;
}

const checkboxStyle = style({ marginLeft: 5 });
const secondLevelStyle = style({ marginLeft: 14 });
const spacerStyle = style({ height: '1em' });

export class MetricsSettingsPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showAverage: true,
      showQuantiles: ['0.5', '0.95', '0.99'],
      activeLabels: [],
      labelValues: new Map()
    };
  }

  onGroupingChanged = (label: LabelDisplayName, checked: boolean) => {
    const newLabels = checked
      ? [label].concat(this.state.activeLabels)
      : this.state.activeLabels.filter(g => label !== g);
    this.setState({ activeLabels: newLabels }, () => this.props.onGroupingChanged(newLabels));
  };

  onHistogramAverageChanged = (checked: boolean) => {
    this.setState({ showAverage: checked }, () => this.props.onHistogramAverageChanged(checked));
  };

  onHistogramQuantilesChanged = (quantile: Quantiles, checked: boolean) => {
    const newQuantiles = checked
      ? [quantile].concat(this.state.showQuantiles)
      : this.state.showQuantiles.filter(q => quantile !== q);
    this.setState({ showQuantiles: newQuantiles }, () => this.props.onHistogramQuantilesChanged(newQuantiles));
  };

  onLabelsFiltersChanged = (label: LabelDisplayName, value: string, checked: boolean) => {
    const newLabels = new Map();
    this.state.labelValues.forEach((val, key) => {
      const newVal = assign(val)({});
      if (key === label) {
        newVal[value] = checked;
      }
      newLabels.set(key, newVal);
    });
    this.setState({ labelValues: newLabels });
    this.props.onLabelsFiltersChanged(newLabels);
  };

  render() {
    const hasHistograms = this.props.hasHistograms;
    const hasLabels = this.state.labelValues.size > 0;
    if (!hasHistograms && !hasLabels) {
      return null;
    }

    return (
      <>
        {hasLabels && this.renderLabelOptions()}
        {hasHistograms && this.renderHistogramOptions()}
      </>
    );
  }

  renderLabelOptions(): JSX.Element {
    const displayGroupingLabels: any[] = [];
    this.state.labelValues.forEach((values, name) => {
      const checked = this.state.activeLabels.includes(name);
      const labelsHTML = values
        ? Object.keys(values).map(val => (
            <div key={'groupings_' + name + '_' + val} className={secondLevelStyle}>
              <label>
                <input
                  type="checkbox"
                  checked={values[val]}
                  onChange={event => this.onLabelsFiltersChanged(name, val, event.target.checked)}
                />
                <span className={checkboxStyle}>{val}</span>
              </label>
            </div>
          ))
        : null;
      displayGroupingLabels.push(
        <div key={'groupings_' + name}>
          <label>
            <input
              type="checkbox"
              checked={checked}
              onChange={event => this.onGroupingChanged(name, event.target.checked)}
            />
            <span className={checkboxStyle}>{name}</span>
          </label>
          {checked && labelsHTML}
        </div>
      );
    });
    return (
      <>
        <label>Show metrics by:</label>
        {displayGroupingLabels}
        <div className={spacerStyle} />
      </>
    );
  }

  renderHistogramOptions(): JSX.Element {
    const displayHistogramOptions = [(
      <div key={'histo_avg'}>
        <label>
          <input
            type="checkbox"
            checked={this.state.showAverage}
            onChange={event => this.onHistogramAverageChanged(event.target.checked)}
          />
          <span className={checkboxStyle}>Average</span>
        </label>
      </div>
    )].concat(
      allQuantiles.map((o, idx) => {
        const checked = this.state.showQuantiles.includes(o);
        return (
          <div key={'histo_' + idx}>
            <label>
              <input
                type="checkbox"
                checked={checked}
                onChange={event => this.onHistogramQuantilesChanged(o, event.target.checked)}
              />
              <span className={checkboxStyle}>Quantile {o}</span>
            </label>
          </div>
        );
      })
    );
    return (
      <>
        <label>Histograms:</label>
        {displayHistogramOptions}
        <div className={spacerStyle} />
      </>
    );
  }
}
