import { observer } from 'mobx-react';
import { InlineBalance } from 'parity-reactive-ui';
import React, { Component } from 'react';

import auctionStore from '../../stores/auction.store';

@observer
export default class Price extends Component {
  render () {
    const { price } = auctionStore;

    return (
      <div>
        Price:
        <InlineBalance
          precise
          units='finney'
          value={price}
        />
      </div>
    );
  }
}
