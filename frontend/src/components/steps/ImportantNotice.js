import React, { Component } from 'react';
import { Button, Header } from 'semantic-ui-react';

import appStore from '../../stores/app.store';

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
            The Polkadot token sale requires experience and knowledge of <b>sending and receiving
            Ether</b>, and the <b>safe storage of JSON wallet files</b>.
          </p>

          <p style={{ lineHeight: '1.5em' }}>
            Polkadot will <b>not</b> provide any customer support for the registration process.
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
