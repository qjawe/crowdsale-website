import React, { Component } from 'react';
import { Header, Loader } from 'semantic-ui-react';

import accountStore from '../../stores/account.store';

export default class FeePayment extends Component {
  componentWillMount () {
    accountStore.watchPurchase();
  }

  componentWillUnmount () {
    accountStore.unwatchPurchase();
  }

  render () {
    return (
      <div style={{ textAlign: 'center' }}>
        <Loader active inline='centered' size='huge' />

        <Header as='h2' style={{ textTransform: 'uppercase' }}>
          Processing purchase
        </Header>
      </div>
    );
  }
}
