import BigNumber from 'bignumber.js';
import React, { Component } from 'react';
import { Button, Header, Input } from 'semantic-ui-react';

import { fromWei, toWei } from '../../utils';

import accountStore from '../../stores/account.store';
import auctionStore from '../../stores/auction.store';
import feeStore from '../../stores/fee.store';
import appStore from '../../stores/app.store';
import AccountInfo from '../AccountInfo';
import Step from '../Step';

export default class AccountLoader extends Component {
  state = {
    dots: new BigNumber(0),
    spending: new BigNumber(0)
  };

  render () {
    const { address } = accountStore;
    const { spending } = this.state;

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

          <div style={{ marginTop: '1.5em' }}>
            <span>
              How much ETH would you like to spend?
            </span>
            <Input
              defaultValue={0}
              label='ETH'
              labelPosition='right'
              onChange={this.handleSpendChange}
              style={{
                marginLeft: '1.5em',
                width: '6.5em'
              }}
              type='number'
              min={0}
              step={0.01}
            />
          </div>
          {
            spending
              ? (
                <div>
                  {this.renderSending()}
                  {this.renderFee()}
                </div>
              )
              : null
          }
          {this.renderAction()}
        </div>
      </Step>
    );
  }

  renderAction () {
    const { certified } = accountStore;
    const { spending } = this.state;

    return (
      <div style={{ textAlign: 'right', marginTop: '1.5em' }}>
        <Button primary onClick={this.handleContinue} disabled={!spending || spending.eq(0)}>
          {
            certified
              ? 'Contribute'
              : 'Certify your identity'
          }
        </Button>
      </div>
    );
  }

  renderFee () {
    const { certified, paid } = accountStore;
    const { totalFee } = feeStore;

    if (certified || paid) {
      return;
    }

    return (
      <div style={{ marginTop: '0.5em', color: 'gray', fontSize: '0.85em' }}>
        An additional fee of {fromWei(totalFee).toFormat()} ETH will be needed for certification.
      </div>
    );
  }

  renderSending () {
    const { dots, spending } = this.state;

    if (!dots) {
      return null;
    }

    return (
      <div style={{ marginTop: '1.5em', color: 'gray' }}>
        By spending {spending.toFormat()} ETH you will receive at least {dots.toFormat()} DOTs.
      </div>
    );
  }

  handleContinue = () => {
    const { spending } = this.state;

    if (!spending || spending.eq(0)) {
      return;
    }

    accountStore.setSpending(toWei(spending));
    appStore.goto('payment');
  };

  handleSpendChange = async (_, { value }) => {
    let spending = null;
    let dots = null;

    try {
      spending = new BigNumber(value);
      dots = auctionStore.weiToDot(toWei(spending));
    } catch (error) {
    }

    this.setState({ dots, spending });
  };
}
