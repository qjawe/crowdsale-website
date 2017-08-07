import keycode from 'keycode';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import { AccountIcon } from 'parity-reactive-ui';
import { Button, Container, Checkbox, Dimmer, Icon, Input, Label, Loader, Message, Popup, Segment } from 'semantic-ui-react';

import accountStore from '../stores/account.store';
import auctionStore from '../stores/auction.store';

const hSpaceStyle = {
  width: '0.5em'
};

const dropzoneStyle = {
  cursor: 'pointer',
  width: 400,
  height: 200,
  borderWidth: 2,
  borderColor: '#666',
  borderStyle: 'dashed',
  borderRadius: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  margin: '0.5em auto'
};

const innerDropzoneStyle = {
  width: 200,
  textAlign: 'center'
};

@observer
export default class AccountManager extends Component {
  state = {
    loading: false,
    rememberWallet: false
  };

  password = '';

  render () {
    const { loading } = this.state;
    const { address, unlocked } = accountStore;

    if (unlocked) {
      return (
        <Container textAlign='center'>
          <div>{ this.renderAccountInfo(address) }</div>
          <div>{ this.renderBalances() }</div>
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
    const { certified } = accountStore;
    let color = 'yellow';

    if (certified !== null) {
      color = certified
        ? 'green'
        : 'red';
    }

    const certifiedIcon = certified !== false
      ? null
      : (
        <span>
          <span style={hSpaceStyle}>&nbsp;</span>
          <Popup
            content={`
              Lorem ipsum dolor sit amet,
              consectetur adipiscing elit.
              Pellentesque urna erat, lacinia
              vitae mollis finibus, consequat in
              tortor. Sed nec elementum tortor.
            `}
            size='small'
            trigger={<Icon name='info circle' />}
          />
        </span>
      );

    return (
      <div style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
      }}>
        <AccountIcon
          address={address}
          style={{ height: 32 }}
        />
        <Label
          color={color}
          size='large'
          style={{
            marginLeft: '0.5em'
          }}
        >
          {address}
        </Label>
        {certifiedIcon}
      </div>
    );
  }

  renderBalances () {
    const { balances } = accountStore;
    const { currentPrice } = auctionStore;

    if (!balances.eth && !balances.accounted) {
      return null;
    }

    return (
      <div>
        <Label>
          {balances.eth.div(Math.pow(10, 18)).toFormat(3)}
          <Label.Detail>
            ETH
          </Label.Detail>
        </Label>
        <Label>
          >= {balances.accounted.div(currentPrice).toFormat(3)}
          <Label.Detail>
            DOT
          </Label.Detail>
        </Label>
      </div>
    );
  }

  renderContent () {
    const { address, wallet } = accountStore;
    const { rememberWallet } = this.state;

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
        <div>{ this.renderAccountInfo(address) }</div>
        <br />

        {
          !wallet.fromLS
          ? (
            <div>
              <Checkbox
                checked={rememberWallet}
                label='Remember my password-encrypted wallet'
                onChange={this.handleRememberWalletChange}
                style={{ marginBottom: '1em' }}
              />
            </div>
          )
          : null
        }

        <Input
          autoFocus
          label={
            <Button
              content='Unlock your wallet'
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

  handleRememberWalletChange = (_, element) => {
    const { checked } = element;

    this.setState({ rememberWallet: checked });
  };

  handleUnlockAccount = () => {
    const { rememberWallet } = this.state;

    this.setState({ loading: true });

    return accountStore.unlock(this.password, rememberWallet)
      .then(() => {
        this.password = '';
        this.setState({ loading: false });
      });
  };
}
