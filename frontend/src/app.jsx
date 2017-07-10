import React, { Component } from 'react';
import { get, formatUnit } from './utils';

const WEI_IN_ETH = 1000000000000000000;

export default class App extends Component {
  constructor (props) {
    super(props);

    this._timeout = null;
    this.state = {
      block: 0,
      current: 0,
      begin: 0,
      end: 0,
      timeLeft: 0,
      price: 0,
      available: 0,
      cap: 0,
      connected: 'disconnected'
    };
  }

  componentWillMount () {
    this.update();
    this._counter = setInterval(() => {
      this.setState({ timeLeft: this.calculateTimeLeft() });
    }, 1000);
  }

  componentWillUnmount () {
    clearTimeout(this._update);
    clearInterval(this._counter);
  }

  async update () {
    const status = await get('http://localhost:4000/');
    const { current, end } = status;

    status.timeLeft = Math.max(0, end - current);

    this.setState(status);

    this._update = setTimeout(() => this.update(), 5000);
  }

  get timeNow () {
    return new Date() / 1000 | 0;
  }

  calculateTimeLeft () {
    return Math.max(0, this.state.end - this.timeNow);
  }

  render () {
    const { timeLeft } = this.state;

    const days = timeLeft / 86400 | 0;
    const hours = (timeLeft % 86400) / 3600 | 0;
    const minutes = (timeLeft % 3600) / 60 | 0;
    const seconds = timeLeft % 60;

    const timeLeftParts = [];

    const atLeastDay = timeLeft > 86400;
    const atLeastHour = timeLeft > 3600;
    const atLeastMinute = timeLeft > 60;

    if (timeLeft >= 86400) {
        timeLeftParts.push(formatUnit(days, 'day'));
    }
    if (timeLeft >= 3600) {
        timeLeftParts.push(formatUnit(hours, 'hour'));
    }
    if (timeLeft >= 60) {
        timeLeftParts.push(formatUnit(minutes, 'minute'));
    }
    timeLeftParts.push(formatUnit(seconds, 'second'));

    return (
      <div style={ { fontFamily: 'monospace' } }>
        <h1>Price: Ξ{ this.state.price / WEI_IN_ETH }</h1>
        <p>Block: { this.state.block } | Tokens available: { this.state.available } / { this.state.cap }</p>
        <p>At current price the sale will end in { timeLeftParts.join(' ') }</p>
      </div>
    );
  }
}
