import React, { Component } from 'react';
import { Header, Loader } from 'semantic-ui-react';
import QRCode from 'qrcode.react';

import AccountInfo from '../AccountInfo';

// import appStore from '../../stores/app.store';
import accountStore from '../../stores/account.store';

import { fromWei } from '../../utils';

export default class Payment extends Component {
  componentWillMount () {
    accountStore.watchPayment();
  }

  componentWillUnmount () {
    accountStore.unwatchPayment();
  }

  render () {
    const { address, missingWei } = accountStore;
    const link = `web+ethereum:${address}?value=${missingWei.toNumber()}&gas=21000`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Header as='h2'>
          PLEASE ADD {fromWei(missingWei).toFormat()} ETH TO THE ADDRESS BELOW
        </Header>

        <div style={{
          fontSize: '1em',
          margin: '2em 0 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <AccountInfo
            address={address}
          />

          <a href={link} style={{ marginTop: '1em', display: 'block' }}>
            <QRCode
              level='M'
              size={192}
              value={address}
            />
          </a>

          <div style={{
            margin: '1.5em 0',
            color: 'red',
            fontSize: '1.25em',
            display: 'flex'
          }}>
            <Loader active inline size='tiny' style={{ marginRight: '0.5em' }} />
            <span>Waiting for transaction...</span>
          </div>
        </div>
      </div>
    );
  }
}
