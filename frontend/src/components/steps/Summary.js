import React, { Component } from 'react';
import { Button, Header } from 'semantic-ui-react';

import AccountInfo from '../AccountInfo';

// import appStore from '../../stores/app.store';
import accountStore from '../../stores/account.store';
import auctionStore from '../../stores/auction.store';

import { fromWei } from '../../utils';

export default class Summary extends Component {
  render () {
    const { accounted, address, spending } = accountStore;
    const dots = auctionStore.weiToDot(accounted);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Header as='h2'>
          YOU HAVE CONTRIBUTED TO THE AUCTION
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

          <div style={{ marginTop: '1.5em', fontSize: '1.25em' }}>
            You have successfully contributed {fromWei(spending).toFormat()} ETH and will
            receive at least {dots.toFormat()} DOTs
          </div>

          <div style={{ marginTop: '1em', fontSize: '1.25em' }}>
            You will receive your DOTs once the sale has ended to the address above
          </div>

          <div style={{ marginTop: '2.5em' }}>
            <Button primary size='big'>
              Return to the main website
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
