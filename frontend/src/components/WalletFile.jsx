import React, { Component } from 'react';
import keythereum from 'keythereum';
import { InlineAccount, BButton } from 'parity-reactive-ui';

const IDLE = Symbol('IDLE');
const ERROR = Symbol('ERROR');
const LOADING = Symbol('LOADING');
const LOCKED = Symbol('LOCKED');
const UNLOCKING = Symbol('UNLOCKING');
const UNLOCKED = Symbol('UNLOCKED');

export default class WalletFile extends Component {
  constructor (props) {
    super(props);

    this.state = {
      status: IDLE
    };
  }

  onChange (event) {
    console.log(this);

    const file = event.target.files[0];

    if (!file) {
      return;
    }

    this.setState({ status: LOCKED });

    const reader = new FileReader();

    reader.readAsText(file);
    reader.addEventListener('load', (event) => {
      const keyObject = JSON.parse(event.target.result);

      this.setState({ status: LOCKED, keyObject });
    });
  }

  promptFileExplorer () {
    this.fileInput.click();
  }

  render () {
    const { status } = this.state;

    if (status === LOCKED) {
      const address = `0x${this.state.keyObject.address}`;
      return (
        <span>
          <AccountIcon address={ address }/>
          <strong>{ address }</strong>
        </span>
      )
    }

    return (
      <span>
        <BButton content='Load wallet file' onClick={ this.promptFileExplorer.bind(this) }/>
        <input ref={(input) => this.fileInput = input} type="file" style={ { display: 'none' } } onChange={ this.onChange.bind(this) }/>
      </span>
    )
  }
}
