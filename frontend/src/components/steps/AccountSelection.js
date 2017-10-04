import React, { Component } from 'react';
import { Card, Header, Image } from 'semantic-ui-react';

import EthereumImg from '../../images/ethereum.png';

import appStore from '../../stores/app.store';
import accountStore from '../../stores/account.store';
import AccountCreator from '../AccountCreator';
import AccountLoader from '../AccountLoader';

const cardStyle = {
  margin: '0 2em 1em',
  borderRadius: '1em',
  flex: '1',
  maxWidth: '350px'
};

const imageStyle = {
};

export default class AccountSelection extends Component {
  state = {
    action: null,
    jsonWallet: null
  };

  render () {
    const { action } = this.state;

    if (action === 'load') {
      return (
        <AccountLoader
          onCancel={this.handleReset}
          onDone={this.handleDone}
        />
      );
    }

    if (action === 'create') {
      return (
        <AccountCreator
          onCancel={this.handleReset}
          onDone={this.handleDone}
        />
      );
    }

    return this.renderChoose();
  }

  renderChoose () {
    return (
      <div>
        <Header as='h2' textAlign='center'>
          LOAD / GENERATE YOUR WALLET
        </Header>

        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', marginTop: '4em' }}>
          <Card fluid link style={cardStyle} onClick={this.handleLoad}>
            <Image src={EthereumImg} style={imageStyle} />
            <Card.Content>
              <Card.Header textAlign='center' style={{ padding: '1em 0' }}>
                Load an Ethereum JSON file
              </Card.Header>
            </Card.Content>
          </Card>

          <Card fluid link style={cardStyle} onClick={this.handleCreate}>
            <Image src={EthereumImg} style={imageStyle} />
            <Card.Content>
              <Card.Header textAlign='center' style={{ padding: '1em 0' }}>
                I don't have an Ethereum Wallet
              </Card.Header>
            </Card.Content>
          </Card>
        </div>
      </div>
    );
  }

  renderCreate () {

  }

  handleDone = ({ address, privateKey }) => {
    accountStore.setAccount({ address, privateKey });
    appStore.gotoContribute(address);
  };

  handleReset = () => {
    this.setState({ action: null });
  };

  handleLoad = () => {
    this.setState({ action: 'load' });
  };

  handleCreate = () => {
    this.setState({ action: 'create' });
  };
}
