import { observer } from 'mobx-react';
import { InlineBalance } from 'parity-reactive-ui';
import React, { Component } from 'react';
import { Statistic } from 'semantic-ui-react';

import auctionStore from '../../stores/auction.store';

@observer
export default class Price extends Component {
  render () {
    const { price } = auctionStore;

    return (
      <Statistic>
        <Statistic.Label>Price</Statistic.Label>
        <Statistic.Value>
          <InlineBalance
            precise
            units='finney'
            value={price}
          />
        </Statistic.Value>
      </Statistic>
    );
  }
}
