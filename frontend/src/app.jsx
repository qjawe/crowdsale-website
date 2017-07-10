import React, { Component } from 'react';
import { get } from './utils';

export default class App extends Component {
  constructor (props) {
    super(props);

    this._timeout = null;
    this.state = {
      block: 0,
      begin: 0,
      end: 0,
      price: 0,
      connected: 'disconnected'
    };
  }

  componentWillMount () {
    console.log('start');
    this.update();
  }

  componentWillUnmount () {
    console.log('end');
    clearTimeout(this._timeout);
  }

  async update () {
    const status = await get('http://localhost:4000/');

    this.setState(status);

    this._timeout = setTimeout(() => this.update(), 1000);
  }

  render () {
    return (
      <div>
        <h1>Crowdsale!</h1>
        <ul>
          <li>Block: { this.state.block }</li>
          <li>Price: { this.state.price }</li>
        </ul>
      </div>
    );
  }
}
