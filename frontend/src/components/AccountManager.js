import keycode from 'keycode';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { AccountIcon } from 'parity-reactive-ui';
import { Input, Button } from 'semantic-ui-react';

import accountStore from '../stores/account.store';

@observer
export default class AccountManager extends Component {
  state = {
    loading: false
  };

  password = '';

  render () {
    const { loading } = this.state;
    const { address, error, unlocked, wallet } = accountStore;

    if (loading) {
      return (
        <div>
          Working...
        </div>
      );
    }

    if (!wallet) {
      return (
        <div>
          { error }

          <Dropzone onDrop={this.handleDropWallet}>
            <p>Drop the JSON wallet file here, or click to select the file.</p>
          </Dropzone>

          <input
            ref={this.onSetFileRef}
            type='file'
            style={{ display: 'none' }}
            onChange={this.onFileChange}
          />
        </div>
      );
    }

    if (!unlocked) {
      return (
        <div>
          { error }
          { this.renderAccountInfo(address) }
          <Input
            label={
              <Button
                content='Unlock'
                onClick={this.handleUnlockAccount}
                primary
              />
            }
            labelPosition='right'
            onChange={this.onPasswordChange} // TODO: Enter should unlock.
            onKeyUp={this.handlePasswordKeyUp}
            type='password'
          />
        </div>
      );
    }

    return (
      <div>
        Unlocked account
        { this.renderAccountInfo(address) }
      </div>
    );
  }

  renderAccountInfo (address) {
    return (
      <div>
        <AccountIcon
          address={address}
          style={{ height: '2em' }}
        />
        <strong style={{ marginLeft: '1em' }}>
          {address}
        </strong>
      </div>
    );
  }

  handleDropWallet = (files) => {
    const file = files[0];

    if (!file) {
      return;
    }

    return accountStore.load(file);
  };

  handlePasswordKeyUp = (event) => {
    const key = keycode(event);

    if (key === 'enter') {
      return this.handleUnlockAccount();
    }
  };

  handleUnlockAccount = () => {
    this.setState({ loading: true });

    return accountStore.unlock(this.password)
      .then(() => {
        this.password = '';
        this.setState({ loading: false });
      });
  };

  /**
   * Open the file selector
   */
  onLoadWalletClick = () => {
    if (!this.fileInput) {
      return;
    }

    return this.fileInput.click();
  };

  onPasswordChange = (event) => {
    const { value } = event.target;

    this.password = value;
  };

  onSetFileRef = (input) => {
    this.fileInput = input;
  };
}
