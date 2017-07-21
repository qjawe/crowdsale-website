import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Progress, Statistic } from 'semantic-ui-react';

import auctionStore from '../../stores/auction.store';

@observer
export default class TokensAvailable extends Component {
  render () {
    const { available, cap } = auctionStore;

    return (
      <Statistic
        title={`${available.toFormat()} / ${cap.toFormat()}`}
      >
        <Statistic.Label>Tokens available</Statistic.Label>
        <Statistic.Value>
          {available.toFormat()}
        </Statistic.Value>
      </Statistic>
    );
  }

  renderProgress () {
    const { available, cap } = auctionStore;

    return (
      <Progress
        color={this.color}
        label='Tokens available'
        progress='ratio'
        total={cap.toNumber()}
        value={available.toNumber()}
      />
    );
  }

  /**
   * Decreasing range of 5 colours
   */
  get color () {
    const { available, cap } = auctionStore;
    const ratio = available.div(cap).mul(100).toNumber();

    if (ratio >= 50) {
      return 'green';
    }

    if (ratio >= 25) {
      return 'olive';
    }

    if (ratio >= 12.5) {
      return 'yellow';
    }

    if (ratio >= 6.25) {
      return 'orange';
    }

    return 'red';
  }
}
