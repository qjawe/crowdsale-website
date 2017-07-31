import { observer } from 'mobx-react';
import { InlineBalance, BalanceBond } from 'parity-reactive-ui';
import React, { Component } from 'react';
import { Button, Container, Dimmer, Loader, Message, Segment } from 'semantic-ui-react';

import Certifier from './Certifier';

import auctionStore from '../stores/auction.store';
import accountStore from '../stores/account.store';
import buyStore from '../stores/buy.store';
import { fromWei, hex2int } from '../utils';

const spendTextStyle = {
  fontSize: '1.3em',
  marginRight: '0.5em'
};

const marginBottomStyle = {
  marginBottom: '1.5em'
};

@observer
export default class Buy extends Component {
  render () {
    if (!accountStore.unlocked) {
      return null;
    }

    if (!buyStore.termsAccepted) {
      return null;
    }

    const { mining, sending } = buyStore;

    return (
      <Segment basic>
        <Dimmer
          active={sending || mining}
          inverted
        >
          <Loader>
            {
              sending
              ? 'Sending transaction'
              : 'Mining transaction'
            }
          </Loader>
        </Dimmer>

        {this.renderTransaction()}
        {this.renderForm()}
      </Segment>
    );
  }

  renderForm () {
    const { divisor } = auctionStore;
    const { spend, spendBond } = buyStore;
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
          <b>{tokens.div(divisor).toFormat()} DOTs</b>
          {this.renderRefund()}
        </div>

        {this.renderSubmitButton()}
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

  renderSubmitButton () {
    const { certified } = accountStore;
    const { spend } = buyStore;

    if (!certified) {
      return (
        <Certifier disabled={!spend.gt(0)} />
      );
    }

    return (
      <Button
        content='Purchase DOTs'
        disabled={!spend.gt(0)}
        onClick={this.handlePurchase}
        primary
      />
    );
  }

  renderTransaction () {
    const { mining, requiredEth, sending, txHash } = buyStore;

    if (requiredEth) {
      const required = hex2int(requiredEth);

      return (
        <div style={marginBottomStyle}>
          <Message negative>
            <Message.Header>Insufficient funds!</Message.Header>
            <div>
              <span>Please top-up your account with </span>
              <InlineBalance
                precise
                value={required}
              />
              <span> and try again.</span>
            </div>
          </Message>
        </div>
      );
    }

    if (!txHash || sending || mining) {
      return null;
    }

    return (
      <div style={marginBottomStyle}>
        <Message positive>
          <Message.Header>Transaction sent!</Message.Header>
          <a
            href={`https://kovan.etherscan.io/tx/${txHash}`}
            target='_blank'
          >
            { txHash }
          </a>
        </Message>
      </div>
    );
  }

  handlePurchase = () => {
    buyStore.purchase();
  };

  handleTermsChecked = (_, { checked }) => {
    buyStore.setTermsAccepted(checked);
  };
}
