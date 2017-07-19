import { observer } from 'mobx-react';
import React, { Component } from 'react';

import auctionStore from '../../stores/auction.store';

@observer
export default class TokensAvailable extends Component {
  render () {
    const { available, cap } = auctionStore;

    return (
      <p>
        Tokens available: { available.toFormat() } / { cap.toFormat() }
      </p>
    );
  }
}
