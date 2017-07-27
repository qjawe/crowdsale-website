import React, { Component } from 'react';
import { Container, Divider, Header } from 'semantic-ui-react';

import AccountManager from './AccountManager';
import Auction from './Auction';
import Buy from './Buy';

const style = {
  padding: '1em 0'
};

export default class App extends Component {
  render () {
    return (
      <div>
        <Container style={style}>
          <Header
            as='h3'
            textAlign='center'
          >
            AUCTION
          </Header>
          <br />
          <Auction.Info />
          <Divider />
          <AccountManager />
          <Buy />
        </Container>
        <Auction.Details />
      </div>
    );
  }
}
