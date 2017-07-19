import { observer } from 'mobx-react';
import { InlineBalance, BalanceBond, BButton } from 'parity-reactive-ui';
import React, { Component } from 'react';
import { Button, Checkbox, Container, Segment } from 'semantic-ui-react';

import Terms from '../terms.md';

import accountStore from '../stores/account.store';
import buyStore from '../stores/buy.store';
import { hex2int } from '../utils';

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

    const { termsAccepted, txHash } = buyStore;

    if (txHash) {
      return this.renderTransaction();
    }

    return (
      <div>
        {this.renderForm()}
        <Segment>
          <Terms />
        </Segment>
        <div>
          <Checkbox
            label={`
              I agree to have these Terms and Conditions
              signed my behalf using my private key.
            `}
            checked={termsAccepted}
            onChange={this.handleTermsChecked}
          />
        </div>
        {this.renderPurchase()}
      </div>
    );
  }

  renderForm () {
    const { spendBond } = buyStore;
    const { tokens } = buyStore.theDeal;

    return (
      <Container textAlign='center'>
        <div>
          <span style={spendTextStyle}>I would like to spend </span>
          <BalanceBond
            bond={spendBond}
            valid
          />
        </div>
        <div style={spendTextStyle}>
          <span>for which I will receive </span>
          <b>at least {tokens.toFormat()} DOTs</b>
          {this.renderRefund()}
        </div>
      </Container>
    );
  }

  renderRefund () {
    const { refund } = buyStore.theDeal;

    if (refund.lte(0)) {
      return null;
    }

    return (
      <span>
        <span> and be refunded </span>
        <b>at least <InlineBalance value={refund} /></b>
      </span>
    );
  }

  renderPurchase () {
    const { termsAccepted } = buyStore;

    if (!termsAccepted) {
      return null;
    }

    return (
      <Container textAlign='right'>
        <Button
          content='Purchase DOTs'
          onClick={this.handlePurchase}
          primary
        />
      </Container>
    );
  }

  renderTransaction () {
    const { requiredEth, txHash } = buyStore;

    if (requiredEth) {
      const required = hex2int(requiredEth);

      return (
        <div>
          <div>Insufficient funds!</div>
          <div>
            <span>Transaction has been queued and will be sent once </span>
            <InlineBalance
              precise
              value={required}
              units='finney'
            />
            <span> is on the account.</span>
          </div>
        </div>
      );
    }

    if (txHash === '0x') {
      return (
        <div>Sending transaction...</div>
      );
    }

    return (
      <div>
        <div>Transaction sent!</div>
        <div>
          <a
            href={`https://kovan.etherscan.io/tx/${txHash}`}
          >
            { txHash }
          </a>
        </div>
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
