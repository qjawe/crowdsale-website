import React, { Component } from 'react';
import { Card, Header, Image } from 'semantic-ui-react';

import EthereumImg from '../../images/ethereum.png';

import AccountLoader from '../AccountLoader';

const cardStyle = {
  margin: '0 2em 1em',
  borderRadius: '1em',
  flex: '1'
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
        <AccountLoader onBack={this.handleReset} />
      );
    }

    if (action === 'create') {
      return this.renderCreate();
    }

    return this.renderChoose();
  }

  renderChoose () {
    return (
      <div>
        <Header as='h2' textAlign='center'>
          LOAD / GENERATE YOUR WALLET
        </Header>

        <div style={{ display: 'flex', width: '100%', marginTop: '4em' }}>
          <Card fluid link style={cardStyle} onClick={this.handleLoad}>
            <Image src={EthereumImg} />
            <Card.Content>
              <Card.Header textAlign='center' style={{ padding: '1em 0' }}>
                Load an Ethereum JSON file
              </Card.Header>
            </Card.Content>
          </Card>

          <Card fluid link style={cardStyle} onClick={this.handleCreate}>
            <Image src={EthereumImg} />
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
