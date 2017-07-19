import { observer } from 'mobx-react';
import { InlineBalance, BalanceBond, BButton } from 'parity-reactive-ui';
import React, { Component } from 'react';
import { Segment, Checkbox } from 'semantic-ui-react';

import Terms from '../terms.md';

import accountStore from '../stores/account.store';
import buyStore from '../stores/buy.store';
import { hex2int } from '../utils';

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
        {this.renderForm()}
      </div>
    );
  }

  renderForm () {
    const { spendBond, termsAccepted } = buyStore;

    if (!termsAccepted) {
      return null;
    }

    return (
      <div>
        <div>
          <span>Enter how much you would like to spend: </span>
          <BalanceBond
            bond={spendBond}
            valid
          />
        </div>
        <div>
          {this.renderSpendInfo()}
        </div>
      </div>
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

  renderSpendInfo () {
    const { spend } = buyStore;
    const { tokens } = buyStore.theDeal;

    if (spend.lte(0)) {
      return null;
    }

    return (
      <div>
        <span>By spending </span>
        <InlineBalance value={spend} />
        <span>, you will receive </span>
        <b>at least {tokens.toFormat()} DOTs</b>
        <span>
          {this.renderRefund()}
        </span>
        <span>.</span>
        <br />
        <BButton
          content='Purchase DOTs'
        />
      </div>
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
            <span>is on the account.</span>
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

  handleTermsChecked = (_, { checked }) => {
    buyStore.setTermsAccepted(checked);
  };
}
