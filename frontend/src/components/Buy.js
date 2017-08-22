import { observer } from 'mobx-react';
import { BalanceBond } from 'parity-reactive-ui';
import React, { Component } from 'react';
import { Button, Container, Segment } from 'semantic-ui-react';

import Certifier from './Certifier';

import auctionStore from '../stores/auction.store';
import accountStore from '../stores/account.store';
import buyStore from '../stores/buy.store';
import { fromWei } from '../utils';

const spendTextStyle = {
  fontSize: '1.3em',
  marginRight: '0.5em'
};

@observer
export default class Buy extends Component {
  render () {
    if (!accountStore.unlocked) {
      return null;
    }

    const { notFromJapan, termsAccepted } = buyStore;

    if (!termsAccepted || !notFromJapan) {
      return null;
    }

    return (
      <Segment basic>
        {this.renderContent()}
      </Segment>
    );
  }

  renderContent () {
    const { certified } = accountStore;

    if (!certified) {
      return (
        <Container textAlign='center'>
          <Certifier />
        </Container>
      );
    }

    return this.renderForm();
  }

  renderForm () {
    const { DIVISOR } = auctionStore;
    const { loading, spend, spendBond } = buyStore;
    const { tokens } = buyStore.theDeal;

    return (
      <Container textAlign='center'>
        <div>
          <span style={spendTextStyle}>
            How much ETH would you like to spend?
          </span>
          <BalanceBond
            bond={spendBond}
            valid
          />
        </div>
        <div style={{
          ...spendTextStyle,
          fontSize: '1.1em',
          margin: '1em 0 2em'
        }}>
          <span>By spending </span>
          <b>{fromWei(spend).toFormat()} ETH</b>
          <span> you will receive at least </span>
          <b>{tokens.div(DIVISOR).toFormat()} DOTs</b>
          {this.renderRefund()}
        </div>

        <Button
          content='Purchase DOTs'
          disabled={!spend.gt(0) || loading}
          loading={loading}
          onClick={this.handlePurchase}
          primary
        />
      </Container>
    );
  }

  renderRefund () {
    const { refund } = buyStore.theDeal;

    if (refund.lte(0)) {
      return null;
    }

    return (
      <span style={{ marginTop: '0.5em' }}>
        <br />
        <span> and be refunded at least </span>
        <b>{fromWei(refund).toFormat(3)} ETH</b>
      </span>
    );
  }

  handlePurchase = () => {
    buyStore.purchase();
  };

  handleTermsChecked = (_, { checked }) => {
    buyStore.setTermsAccepted(checked);
  };
}
