import React, { Component } from 'react';
import { Header } from 'semantic-ui-react';

import accountStore from '../../stores/account.store';
import appStore from '../../stores/app.store';
import AccountInfo from '../AccountInfo';
import Step from '../Step';

export default class AccountLoader extends Component {
  render () {
    const { address } = accountStore;

    return (
      <Step
        title='ADD CONTRIBUTION TO WALLET'
        description={(
          <div>
            <p>
              Please confirm how much ETH you would like to contribute
              to the sale.
            </p>
            <p>
              At the end of the auction, you will be notified of the amount
              of DOTs you have received.
            </p>
            <p style={{ color: 'red', fontWeight: 'bold' }}>
              Be advised that by clicking “certify your identity” you will
              not be able to change the amount contributed to the sale.
              Once verified, your wallet will be debited by the amount
              you have chosen to contribute.
            </p>
          </div>
        )}
      >
        <div>
          <Header as='h3'>
            Your Ethereum address
          </Header>
          <AccountInfo
            address={address}
          />
        </div>
      </Step>
    );
  }
}
