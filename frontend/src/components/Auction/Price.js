import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Statistic } from 'semantic-ui-react';

import auctionStore from '../../stores/auction.store';

@observer
export default class Price extends Component {
  render () {
    const { currentPrice } = auctionStore;

    return (
      <Statistic>
        <Statistic.Label>Current Price</Statistic.Label>
        <Statistic.Value>
          <span>{auctionStore.formatPrice(currentPrice).toFormat(5)}</span>
          <small> ETH/DOT</small>
        </Statistic.Value>
      </Statistic>
    );
  }
}
