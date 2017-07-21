import { observer } from 'mobx-react';
import { InlineBalance } from 'parity-reactive-ui';
import React, { Component } from 'react';
import { Statistic } from 'semantic-ui-react';

import auctionStore from '../../stores/auction.store';

/**
 * <span> | EARLY-BIRD BONUS {bonusSize.toNumber()}%</span>
 */

@observer
export default class Spendable extends Component {
  render () {
    const { bonusSize, inBonus, maxSpend } = auctionStore;

    return (
      <Statistic>
        <Statistic.Label>Maximum spend</Statistic.Label>
        <Statistic.Value>
          <InlineBalance value={maxSpend} />
        </Statistic.Value>
      </Statistic>
    );
  }
}
