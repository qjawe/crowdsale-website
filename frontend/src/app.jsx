import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formatUnit } from './utils';
import { Bond } from 'oo7';
import { Rspan } from 'oo7-react';
import { InlineBalance, BalanceBond, BButton } from 'parity-reactive-ui';
import humanizeDuration from 'humanize-duration';

function mapStateToProps (state) {
  const { block, price, available, cap, timeLeft, begin, bonusSize, bonusDuration, currentTime } = state;

  return { block, price, available, cap, timeLeft, begin, bonusSize, bonusDuration, currentTime };
}

class App extends Component {
  constructor () {
      super();
      this.spend = new Bond;
      window.value = this.spend;
  }
  render () {
      const { block, price, available, cap, timeLeft, begin, bonusDuration, bonusSize, currentTime } = this.props;

      // TODO: should use the more recent block's time.
      const inBonus = block.timestamp - begin + 120 < bonusDuration;

      console.log(`currentTime: ${block.timestamp}, begin: ${begin}, running: ${block.timestamp - begin}, bonusSize: ${bonusSize}, duration: ${bonusDuration}`);

      return (
        <div style={ { fontFamily: 'monospace' } }>
          <h1>Price: <InlineBalance value={price} units='finney' precise/></h1>
          <p>Block: { block.number } | Tokens available: { available } / { cap }{inBonus ? (<span> | EARLY-BIRD BONUS {bonusSize}%</span>) : null}</p>
          <p>The sale will end before {humanizeDuration(timeLeft * 1000)}, depending on how many more people buy in.</p>

          <div style={{textAlign: 'center', margin: '1em 2em'}}>
            <div>Enter how much you would like to spend: <BalanceBond bond={this.spend}/></div>

            <div>By spending <InlineBalance value={this.spend}/>, you will receive <Rspan>{this.spend.map(v => <b>at least {Math.floor(v / price * (100 + (inBonus ? bonusSize : 0)) / 100)} DOTs</b>)}</Rspan>.</div>

            <BButton content='Purchase DOTs' onClick={() => this.spend.then(v => alert(`TODO: Spend ${v} Wei on DOTs`))}/>
          </div>

        </div>
      );
  }
}

export default connect(mapStateToProps, null)(App);
