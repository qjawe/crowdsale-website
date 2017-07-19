import keycode from 'keycode';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { AccountIcon } from 'parity-reactive-ui';
import { Button, Container, Dimmer, Icon, Input, Label, Loader, Message, Segment } from 'semantic-ui-react';

import accountStore from '../stores/account.store';

const dropzoneStyle = {
  cursor: 'pointer',
  width: '100%',
  height: 200,
  borderWidth: 2,
  borderColor: '#666',
  borderStyle: 'dashed',
  borderRadius: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column'
};

const innerDropzoneStyle = {
  width: 200,
  textAlign: 'center'
};

@observer
export default class AccountManager extends Component {
  state = {
    loading: false
  };

  password = '';

  render () {
    const { loading } = this.state;
    const { address, unlocked } = accountStore;

    if (unlocked) {
      return (
        <Container textAlign='center'>
          <div>{ this.renderAccountInfo(address) }</div>
        </Container>
      );
    }

    return (
      <Segment basic>
        <Dimmer
          active={loading}
          inverted
        >
          <Loader>Working</Loader>
        </Dimmer>
        <div>
          {this.renderError()}
          {this.renderContent()}
        </div>
      </Segment>
    );
  }

  renderAccountInfo (address) {
    return (
      <Label image>
        <AccountIcon
          address={address}
        />
        <strong>
          {address}
        </strong>
      </Label>
    );
  }

  renderContent () {
    const { address, unlocked, wallet } = accountStore;

    if (!wallet) {
      return (
        <div>
          <Dropzone
            onDrop={this.handleDropWallet}
            style={dropzoneStyle}
          >
            <Icon name='file' size='huge' />
            <br />
            <div style={innerDropzoneStyle}>
                Drop a Wallet JSON file here
                or click to select a file.
            </div>
          </Dropzone>
        </div>
      );
    }

    return (
      <Container textAlign='center'>
        <div>Unlocking account</div>
        <div>{ this.renderAccountInfo(address) }</div>
        <br />
        <p>Please type in your password:</p>
        <Input
          autoFocus
          label={
            <Button
              content='Unlock'
              onClick={this.handleUnlockAccount}
              primary
            />
          }
          labelPosition='right'
          onChange={this.handlePasswordChange} // TODO: Enter should unlock.
          onKeyUp={this.handlePasswordKeyUp}
          type='password'
        />
      </Container>
    );
  }

  renderError () {
    const { error } = accountStore;

    if (!error) {
      return null;
    }
    return (
      <Message negative>
        <p>
          <b>Error:</b> {error}
        </p>
      </Message>
    );
  }

  handleDropWallet = (files) => {
    const file = files[0];

    if (!file) {
      return;
    }

    return accountStore.load(file);
  };

  handlePasswordChange = (event) => {
    const { value } = event.target;

    this.password = value;
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
}
