import React, { Component } from 'react';
import { Button, Header } from 'semantic-ui-react';

import appStore from '../stores/app.store';

export default class ImportantNotice extends Component {
  render () {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Header as='h2'>
          IMPORTANT NOTICE
        </Header>

        <div style={{
          fontSize: '1em',
          margin: '2em 0 3em',
          maxWidth: '600px'
        }}>
          <p style={{ lineHeight: '1.5em' }}>
            The Polkadot token sale requires experience and knowledge of sending and receiving
            Ether, and the safe storage of .Json wallet files.
          </p>

          <p style={{ lineHeight: '1.5em' }}>
            Polkadot will not provide any customer support for the registration process.
            By participating in the sale, you assume full responsibility for your funds.
          </p>
        </div>

        <Button primary size='big' onClick={this.handleContinue}>
          Continue
        </Button>
      </div>
    );
  }

  handleContinue = () => {
    appStore.goto('start');
  };
}
