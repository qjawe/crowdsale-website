import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formatUnit } from './utils';
import { Bond } from 'oo7';
import { Rspan } from 'oo7-react';
import { InlineBalance, BalanceBond, BButton } from 'parity-reactive-ui';
import { Segment, Checkbox, Separator } from 'semantic-ui-react';
import { int2hex, hex2int, hex2buf, buildABIData } from './utils';
import Terms from './terms.md';
import backend from './backend';
import EthereumTx from 'ethereumjs-tx';
import { ecsign } from 'ethereumjs-util';
import humanizeDuration from 'humanize-duration';

import AccountManager from './components/AccountManager';
import Auction from './components/Auction';

import auctionStore from './stores/auction.store';

function mapStateToProps (state) {
  const {
    contractAddress,
    statementHash,
    buyinId,
    block,
    price,
    available,
    cap,
    timeLeft,
    begin,
    bonusSize,
    bonusDuration,
    currentTime
  } = state;

  return {
    contractAddress,
    statementHash,
    buyinId,
    block,
    price,
    available,
    cap,
    timeLeft,
    begin,
    bonusSize,
    bonusDuration,
    currentTime
  };
}

class App extends Component {

  render () {
    // const { inBonus, maxSpend, refund, tokens } = this.theDeal;

    return (
      <div style={ { fontFamily: 'monospace' } }>
        <Auction.Info />

        <div style={{textAlign: 'center', margin: '1em 2em'}}>
          <AccountManager />
        </div>
      </div>
    );
  }

  constructor () {
      super();
      this.state = {
        termsAccepted: false
      };
      this.spend = new Bond;
  }

  onWallet ({ address, wallet }) {
    this.setState({ address, wallet });
  }

  onTermsChecked (_, { checked }) {
    this.setState({
      termsAccepted: checked
    });
  }

  async purchase (amount) {
    this.setState({ hash: '0x' });

    const { address, wallet } = this.state;
    const { contractAddress } = this.props;

    if (!address || !wallet) {
      return;
    }

    const nonce = await backend.nonce(address);
    const value = await this.spend;
    const { v, r, s } = ecsign(hex2buf(this.props.statementHash), wallet.privKey);
    const data = buildABIData(this.props.buyinId, v,r, s);

    const tx = new EthereumTx({
      to: contractAddress,
      nonce,
      data,
      gasLimit: int2hex(200000),
      gasPrice: int2hex(50000000000),
      value: int2hex(value)
    });

    tx.sign(wallet.privKey);

    const serializedTx = `0x${tx.serialize().toString('hex')}`;

    const { hash, requiredEth } = await backend.sendTx(serializedTx);

    this.setState({ hash, requiredEth });
  }

  renderForm (inBonus, maxSpend, refund, tokens) {
    if (!this.state.wallet) {
      return null;
    }

    const { hash, requiredEth } = this.state;

    if (hash) {
      if (requiredEth) {
        const required = hex2int(requiredEth);

        return (
          <div>
            <div>Insufficient funds!</div>
            <div>Transaction has been queued and will be sent once <InlineBalance value={required} units='finney' precise/> is on the account.</div>
          </div>
        )
      }

      if (hash === '0x') {
        return (
          <div>Sending transaction...</div>
        );
      }
Terms
      return (
        <div>
          <div>Transaction sent!</div>
          <div><a href={ `https://kovan.etherscan.io/tx/${hash}` }>{ hash }</a></div>
        </div>
      );
    }

    const { price, bonusSize } = this.props;

    return (
      <div>
        <Segment>
          <Terms/>
        </Segment>
        <div>
          <Checkbox onChange={this.onTermsChecked.bind(this)} checked={this.state.termsAccepted} /> I agree to have these Terms and Conditions signed my behalf using my private key.
        </div>
        {this.state.termsAccepted ? (
          <div>
            <div>Enter how much you would like to spend: <BalanceBond bond={this.spend} valid/></div>
            <Rspan>{this.spend.map(v => +v > 0 ?
                <div>By spending <InlineBalance value={this.spend}/>, you will receive <Rspan>{this.spend.map(v => <b>at least {Math.floor(Math.min(v, maxSpend) / price * (100 + (inBonus ? bonusSize : 0)) / 100)} DOTs</b>)}</Rspan>
                <Rspan>{refund.map(v => +v > 0 ? (<span> and be refunded <b>at least <InlineBalance value={v}/></b></span>) : null)}</Rspan>.<br/>
                <BButton content='Purchase DOTs' onClick={() => this.spend.then(this.purchase.bind(this))}/>
                </div>
            : null)}</Rspan>
          </div>
        ) : null }
      </div>
    )
  }
}

export default connect(mapStateToProps, null)(App);
