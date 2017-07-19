import React, { Component } from 'react';
import { Container, Divider, Header, Icon } from 'semantic-ui-react';

import AccountManager from './AccountManager';
import Auction from './Auction';
import Buy from './Buy';

const style = {
  margin: '1em 0'
};

export default class App extends Component {
  render () {
    return (
      <Container text style={style}>
        <Header
          as='h2'
          icon
          textAlign='center'
        >
          <Icon name='shop' circular />
          Polkadot Sale
        </Header>
        <Divider />
        <Auction.Info />
        <Divider />
        <AccountManager />
        <Buy />
      </Container>
    );
  }
}
