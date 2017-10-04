import EthereumWallet from 'ethereumjs-wallet';
import keycode from 'keycode';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { Button, Header, Icon, Input } from 'semantic-ui-react';

import appStore from '../stores/app.store';
import AccountInfo from './AccountInfo';
import Step from './Step';

const dropzoneStyle = {
  width: '25em',
  height: '15em',
  borderWidth: '2px',
  borderColor: 'rgb(102, 102, 102)',
  borderStyle: 'dashed',
  borderRadius: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '3em auto 0',
  padding: '2em',
  textAlign: 'center',
  cursor: 'pointer',
  fontSize: '1.25em'
};

export default class AccountLoader extends Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired
  };

  state = {
    jsonWallet: null,
    password: '',
    showPassword: false,
    unlocking: false
  };

  render () {
    const { jsonWallet } = this.state;

    if (!jsonWallet) {
      return this.renderDropzone();
    }

    const { showPassword, password, unlocking } = this.state;

    return (
      <Step
        title="ENTER YOUR WALLET'S PASSWORD"
        description={(
          <p>
            In order for transactions to be signed,
            we need to unlock your account with the
            password you have chosen.
          </p>
        )}
      >
        <div>
          <AccountInfo
            address={`0x${jsonWallet.address}`}
            showCertified={false}
          />
          <br />
          <br />
          <p><b>
            Please enter your password:
          </b></p>
          <Input
            action={{
              icon: 'eye',
              onKeyDown: this.handleShowPassword,
              onKeyUp: this.handleHidePassword,
              onMouseDown: this.handleShowPassword,
              onMouseLeave: this.handleHidePassword,
              onBlur: this.handleHidePassword,
              onMouseUp: this.handleHidePassword
            }}
            fluid
            onChange={this.handlePasswordChange}
            onKeyUp={this.handlePasswordKeyUp}
            placeholder='Enter your password...'
            ref={this.setPasswordRef}
            type={showPassword ? 'text' : 'password'}
            value={password}
          />
          <br /><br />
          <div style={{ textAlign: 'right' }}>
            <Button
              color='green'
              icon='unlock'
              content='Unlock'
              loading={unlocking}
              onClick={this.handleUnlock}
            />
          </div>
        </div>
      </Step>
    );
  }

  renderDropzone () {
    const { onCancel } = this.props;

    return (
      <div>
        <Header as='h2' textAlign='center'>
          LOAD YOUR WALLET
        </Header>

        <Dropzone onDrop={this.handleDrop} style={dropzoneStyle}>
          <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
            <Icon name='file text outline' size='huge' />
            <br />
            <br />
            <p style={{ margin: 0 }}>
              Drop you Ethereum JSON Wallet file here,
              or click to open the file selector.
            </p>
          </div>
        </Dropzone>

        <br />
        <br />

        <div style={{ textAlign: 'center' }}>
          <Button onClick={onCancel} size='big' secondary>
            Back
          </Button>
        </div>
      </div>
    );
  }

  handleDrop = (files) => {
    if (files.length === 0) {
      return;
    }

    if (files[0].size > 2048) {
      return appStore.addError(new Error('The provided file is too big.'));
    }

    const reader = new FileReader();

    reader.readAsText(files[0]);
    reader.onload = (event) => {
      const content = event.target.result;

      try {
        if (content.length > 2048) {
          throw new Error('file too big: ' + content.length);
        }

        const json = JSON.parse(content);

        if (!json || !json.address || !json.crypto || !json.crypto.kdf) {
          throw new Error('wrong json');
        }

        if (json.version !== 3) {
          throw new Error('wrong wallet version');
        }

        this.setState({ jsonWallet: json });
      } catch (error) {
        console.error(error, content);
        appStore.addError(new Error('Invalid file format.'));
      }
    };
  };

  handleHidePassword = () => {
    this.setState({ showPassword: false });
  };

  handleShowPassword = () => {
    this.setState({ showPassword: true });
  };

  handlePasswordChange = (_, { value }) => {
    this.setState({ password: value });
  };

  handlePasswordKeyUp = (event) => {
    const code = keycode(event);

    if (code === 'enter') {
      return this.handleUnlock();
    }
  };

  handleUnlock = async () => {
    if (this.errorId) {
      appStore.removeMessage(this.errorId);
    }

    this.setState({ unlocking: true });

    const { jsonWallet, password } = this.state;

    setTimeout(() => {
      try {
        const wallet = EthereumWallet.fromV3(jsonWallet, password);
        const privateKey = '0x' + wallet.getPrivateKey().toString('hex');

        this.props.onDone({
          address: wallet.getChecksumAddressString(),
          privateKey
        });
      } catch (error) {
        this.errorId = appStore.addError(error);
        this.setState({ unlocking: false });
      }
    });
  };

  setPasswordRef = (inputElement) => {
    if (inputElement) {
      inputElement.focus();
    }
  };
}
