import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Statistic } from 'semantic-ui-react';

import auctionStore from '../../stores/auction.store';

@observer
export default class Price extends Component {
  render () {
    const { endPrice } = auctionStore;

    return (
      <Statistic>
        <Statistic.Label>The final price will be at least</Statistic.Label>
        <Statistic.Value>
          <span>{auctionStore.formatPrice(endPrice).toFormat(5)}</span>
          <small> ETH/DOT</small>
        </Statistic.Value>
      </Statistic>
    );
  }
}
