import { observer } from 'mobx-react';
import { InlineBalance } from 'parity-reactive-ui';
import React, { Component } from 'react';

import auctionStore from '../../stores/auction.store';

@observer
export default class Spendable extends Component {
  render () {
    const { bonusSize, inBonus, maxSpend } = auctionStore;

    return (
      <div>
        Maximum spend:
        <InlineBalance value={maxSpend} />
        {
          inBonus
          ? (<span> | EARLY-BIRD BONUS {bonusSize}%</span>)
          : null
        }
      </div>
    );
  }
}
