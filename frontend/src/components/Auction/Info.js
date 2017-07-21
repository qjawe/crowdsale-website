import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Statistic } from 'semantic-ui-react';

import Bonus from './Bonus';
import Price from './Price';
import Raised from './Raised';
import Spendable from './Spendable';
import TokensAvailable from './TokensAvailable';

import auctionStore from '../../stores/auction.store';

const statGroupStyle = {
  justifyContent: 'center'
};

@observer
export default class Info extends Component {
  render () {
    const { inBonus } = auctionStore;

    return (
      <div>
        <Statistic.Group
          style={statGroupStyle}
          widths={inBonus ? 'two' : 'one'}
        >
          { inBonus ? (<Bonus />) : null }
        </Statistic.Group>
        <br />
        <Statistic.Group
          style={statGroupStyle}
          size='small'
          widths='three'
        >
          <Price />
          <TokensAvailable />
          <Spendable />
        </Statistic.Group>

        <Raised />
      </div>
    );
  }
}
