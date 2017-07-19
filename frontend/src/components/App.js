import React, { Component } from 'react';

import AccountManager from './AccountManager';
import Auction from './Auction';
import Buy from './Buy';

export default class App extends Component {
  render () {
    return (
      <div style={{ fontFamily: 'monospace' }}>
        <Auction.Info />

        <div style={{ textAlign: 'center', margin: '1em 2em' }}>
          <AccountManager />
        </div>

        <Buy />
      </div>
    );
  }
}
