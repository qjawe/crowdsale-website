import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Statistic } from 'semantic-ui-react';

import auctionStore from '../../stores/auction.store';

@observer
export default class TokensAvailable extends Component {
  render () {
    const { tokensAvailable, tokenCap, divisor } = auctionStore;

    return (
      <Statistic
        title={`${tokensAvailable.toFormat()} / ${tokenCap.toFormat()}`}
      >
        <Statistic.Label>Tokens available</Statistic.Label>
        <Statistic.Value>
          {tokensAvailable.div(divisor).toFormat(0)}
        </Statistic.Value>
      </Statistic>
    );
  }
}
