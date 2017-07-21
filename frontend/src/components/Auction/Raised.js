import { observer } from 'mobx-react';
import { InlineBalance } from 'parity-reactive-ui';
import React, { Component } from 'react';
import { Statistic } from 'semantic-ui-react';

import auctionStore from '../../stores/auction.store';

@observer
export default class Raised extends Component {
  render () {
    const { totalReceived } = auctionStore;

    return (
      <Statistic>
        <Statistic.Label>Raised</Statistic.Label>
        <Statistic.Value>
          <InlineBalance value={totalReceived} />
        </Statistic.Value>
      </Statistic>
    );
  }
}
