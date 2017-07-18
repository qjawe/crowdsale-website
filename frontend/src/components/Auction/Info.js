import humanizeDuration from 'humanize-duration';
import { observer } from 'mobx-react';
import React, { Component } from 'react';

import Price from './Price';
import TokensAvailable from './TokensAvailable';
import Spendable from './Spendable';

import auctionStore from '../../stores/auction.store';

@observer
export default class Info extends Component {
  render () {
    return (
      <div>
        <h1>
          <Price />
        </h1>
        <div>
          <TokensAvailable />
          <Spendable />
        </div>
        <p>
          The sale will end before {humanizeDuration(auctionStore.timeLeft * 1000)},
          depending on how many more people buy in.
        </p>
      </div>
    );
  }
}
