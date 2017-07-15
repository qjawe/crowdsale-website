import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formatUnit } from './utils';
import { Bond } from 'oo7';
import { Rspan } from 'oo7-react';
import { InlineBalance, BalanceBond, BButton } from 'parity-reactive-ui';
import { int2hex } from './utils';
import backend from './backend';
import EthereumTx from 'ethereumjs-tx';
import WalletFile from './components/WalletFile';
import humanizeDuration from 'humanize-duration';

function mapStateToProps (state) {
  const {
    contractAddress,
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
  constructor () {
      super();
      this.state = {};
      this.spend = new Bond;
      window.value = this.spend;
  }

  onWallet ({ address, wallet }) {
    this.setState({ address, wallet });
  }

  async purchase (amount) {
    const { address, wallet } = this.state;
    const { contractAddress } = this.props;

    if (!address || !wallet) {
      return;
    }

    const nonce = await backend.nonce(address);
    const value = await this.spend;

    // console.log('address', address, 'nonce', nonce, 'value', int2hex(value));

    const tx = new EthereumTx({
      nonce,
      to: contractAddress,
      data: '0x',
      gasLimit: int2hex(50000),
      gasPrice: int2hex(50000000000),
      value: int2hex(value)
    });

    tx.sign(wallet.privKey);

    const serializedTx = `0x${tx.serialize().toString('hex')}`;

    console.log('tx', serializedTx);
    backend.sendTx(serializedTx);
  }

  get theDeal () {
    const { block, price, available, cap, timeLeft, bonusSize, bonusDuration, begin, currentTime } = this.props;
    const inBonus = block.timestamp - begin + 120 < bonusDuration;
    const maxSpend = price * available;
    const refund = this.spend.map(v => v > maxSpend ? v.sub(maxSpend) : 0);
    const tokens = this
      .spend
      .map((contribution) => Math.floor(contribution / price * (100 + (this.inBonus ? bonusSize : 0))) / 100);
    return {
      inBonus, maxSpend, refund, tokens
    };
  }

  render () {
      const { block, price, available, cap, timeLeft, bonusSize, currentTime } = this.props;
      const { inBonus, maxSpend, refund, tokens } = this.theDeal;

      console.log('timeLeft', timeLeft);

      return (
        <div style={ { fontFamily: 'monospace' } }>
          <h1>Price: <InlineBalance value={price} units='finney' precise/></h1>
          <p>Block: { block.number } | Tokens available: { available } / { cap } | Maximum spend: <InlineBalance value={maxSpend}/>{inBonus ? (<span> | EARLY-BIRD BONUS {bonusSize}%</span>) : null}</p>
          <p>The sale will end before {humanizeDuration(timeLeft * 1000)}, depending on how many more people buy in.</p>

          <div style={{textAlign: 'center', margin: '1em 2em'}}>
            <WalletFile onWallet={ this.onWallet.bind(this) }/>
            { this.renderForm(inBonus, maxSpend, refund, tokens) }
          </div>

        </div>
      );
  }

  renderForm (inBonus, maxSpend, refund, tokens) {
    if (!this.state.wallet) {
      return null;
    }

    const { price, bonusSize } = this.props;

    return (
      <div>
        <div>Enter how much you would like to spend: <BalanceBond bond={this.spend} valid/></div>
        <Rspan>{this.spend.map(v => +v > 0 ?
            <div>By spending <InlineBalance value={this.spend}/>, you will receive <Rspan>{this.spend.map(v => <b>at least {Math.floor(Math.min(v, maxSpend) / price * (100 + (inBonus ? bonusSize : 0)) / 100)} DOTs</b>)}</Rspan>
            <Rspan>{refund.map(v => +v > 0 ? (<span> and be refunded <b>at least <InlineBalance value={v}/></b></span>) : null)}</Rspan>.<br/>
            <BButton content='Purchase DOTs' onClick={() => this.spend.then(this.purchase.bind(this))}/>
            </div>
        : null)}</Rspan>
      </div>
    )
  }
}

export default connect(mapStateToProps, null)(App);
