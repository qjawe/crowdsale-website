import humanizeDuration from 'humanize-duration';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Container, Divider, Label, Statistic } from 'semantic-ui-react';

import Bonus from './Bonus';
import Price from './Price';
import Raised from './Raised';
import Spendable from './Spendable';
import TokensAvailable from './TokensAvailable';

import auctionStore from '../../stores/auction.store';

@observer
export default class Info extends Component {
  render () {
    const { end, inBonus, timeLeft } = auctionStore;

    return (
      <div>
        <Statistic.Group
          widths={inBonus ? 'two' : 'one'}
          size='mini'
        >
          { inBonus ? (<Bonus />) : null }
          <TokensAvailable />
        </Statistic.Group>
        <br />
        <Statistic.Group
          widths='three'
          size='mini'
        >
          <Price />
          <Spendable />
          <Raised />
        </Statistic.Group>

        <Divider />

        <Container textAlign='center'>
          <p>Depending on how many more people buy in, the sale will end before</p>
          <p>
            <Label
              size='large'
              title={new Date(end * 1000)}
            >
              {humanizeDuration(timeLeft * 1000)}
            </Label>
          </p>
        </Container>
      </div>
    );
  }
}
