import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Statistic } from 'semantic-ui-react';

import { fromWei } from '../../utils';

import auctionStore from '../../stores/auction.store';

@observer
export default class Raised extends Component {
  render () {
    const { totalAccounted } = auctionStore;

    return (
      <Statistic>
        <Statistic.Label>Raised</Statistic.Label>
        <Statistic.Value>
          <span>{fromWei(totalAccounted).toFormat(3)}</span>
          <small> ETH</small>
        </Statistic.Value>
      </Statistic>
    );
  }
}
