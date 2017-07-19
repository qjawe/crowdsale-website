import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Statistic } from 'semantic-ui-react';

import auctionStore from '../../stores/auction.store';

@observer
export default class Bonus extends Component {
  render () {
    const { bonusSize, inBonus } = auctionStore;

    return (
      <Statistic>
        <Statistic.Label>Bonus</Statistic.Label>
        <Statistic.Value>
          {
            inBonus
            ? `${bonusSize.toNumber()}%`
            : '0%'
          }
        </Statistic.Value>
      </Statistic>
    );
  }
}
