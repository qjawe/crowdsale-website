import { observer } from 'mobx-react';
import { InlineBalance, BalanceBond } from 'parity-reactive-ui';
import React, { Component } from 'react';
import { Button, Checkbox, Container, Dimmer, Loader, Message, Segment } from 'semantic-ui-react';

import Terms from '../terms.md';

import accountStore from '../stores/account.store';
import buyStore from '../stores/buy.store';
import { hex2int } from '../utils';

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

    const { mining, sending, termsAccepted, txHash } = buyStore;

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
      </Segment>
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
    const { spend, termsAccepted } = buyStore;

    return (
      <Container textAlign='right'>
        <Button
          content='Purchase DOTs'
          disabled={!termsAccepted || !spend.gt(0)}
          onClick={this.handlePurchase}
          primary
        />
      </Container>
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
