import React, { Component } from 'react';
import { Header, Loader } from 'semantic-ui-react';

import accountStore from '../../stores/account.store';

export default class FeePayment extends Component {
  componentWillMount () {
    accountStore.watchFeePayment();
  }

  componentWillUnmount () {
    accountStore.unwatchFeePayment();
  }

  render () {
    return (
      <div style={{ textAlign: 'center' }}>
        <Loader active inline='centered' size='huge' />

        <Header as='h2' style={{ textTransform: 'uppercase' }}>
          Processing fee payment
        </Header>
      </div>
    );
  }
}
