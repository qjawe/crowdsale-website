import React, { Component } from 'react';
import keythereum from 'keythereum';
import { AccountIcon } from 'parity-reactive-ui';
import { Input, Button } from 'semantic-ui-react';

const IDLE = Symbol('IDLE');
const LOADING = Symbol('LOADING');
const LOCKED = Symbol('LOCKED');
const UNLOCKING = Symbol('UNLOCKING');
const UNLOCKED = Symbol('UNLOCKED');

export default class WalletFile extends Component {
  constructor (props) {
    super(props);

    this.state = {
      status: IDLE,
      password: ''
    };
  }

  onFileSet (event) {
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

  onPasswordChange (event) {
    this.setState({ password: event.target.value });
  }

  unlockAccount () {
    this.setState({ status: UNLOCKING });

    // Defer to allow the UI to render before blocking
    setTimeout(() => {
      const { password, keyObject } = this.state;

      let privateKey;
      try {
        privateKey = keythereum.recover(password, keyObject);
      } catch (e) {
        this.setState({ status: LOCKED, error: "Invalid Password" });
        return;
      }

      this.setState({ status: UNLOCKED, error: null, privateKey });
    }, 0);
  }

  get error () {
    const { error } = this.state;

    return error ? <strong>{ error }</strong> : null;
  }

  get address () {
    return this.state.keyObject ? `0x${this.state.keyObject.address}` : null;
  }

  render () {
    const { status } = this.state;

    if (status === UNLOCKING) {
      return (
        <div>Working...</div>
      )
    }

    if (status === LOCKED) {
      return (
        <div>
          { this.error }
          <Input type="password" onChange={ this.onPasswordChange.bind(this) } />
          <Button content='Unlock' onClick={ this.unlockAccount.bind(this) } />
        </div>
      )
    }

    if (status === UNLOCKED) {
      return (
        <div>
          { this.error }
          <div>
            <AccountIcon address={ this.address }/>
            <strong>{ this.address }</strong>
          </div>
        </div>
      )
    }

    return (
      <div>
        { this.error }
        <Button content='Load wallet file' onClick={ this.promptFileExplorer.bind(this) }/>
        <input ref={(input) => this.fileInput = input} type="file" style={ { display: 'none' } } onChange={ this.onFileSet.bind(this) }/>
      </div>
    )
  }
}
