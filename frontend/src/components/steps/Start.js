import React, { Component } from 'react';
import { Button, Header } from 'semantic-ui-react';

import appStore from '../../stores/app.store';

export default class ImportantNotice extends Component {
  render () {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Header as='h2'>
          POLKADOT IDENTITY VERIFICATION PROCESS
        </Header>

        <div style={{
          fontSize: '1em',
          margin: '2em 0 3em',
          maxWidth: '600px'
        }}>
          <p style={{ lineHeight: '1.5em' }}>
            Welcome to the Polkadot token sale registration. The registration process should take approximately 20-30 minutes.
          </p>

          <p style={{ lineHeight: '1.5em' }}>
            Before participating in the sale, you will need to take the following steps:
          </p>

          <p style={{ lineHeight: '1.5em' }}>
            <b>1. Generate a new Ether wallet Json file, or load an existing Json file with the funds you wish to commit.</b> You can
            use your own pre-existing wallet file, or you can generate a new wallet file through our registration process.
            Please note that you will not be able to send funds via an exchange wallet.
          </p>

          <p style={{ lineHeight: '1.5em' }}>
            <b>2. Verify your identity.</b> Because of the existing regulatory environment, you must verify your identity via our
            certification service. In order to do this, your Ether wallet address will be linked to your government issued
            identification. Only addresses that are linked to a verified identity will be permitted to participate.
          </p>

          <p style={{ lineHeight: '1.5em' }}>
            There will be a small fee of €5.00 for the use of this service.
            Once you have completed these steps, you will be able to commit the amount of ETH you would like allocated to the
            project.
          </p>

          <p style={{ lineHeight: '1.5em' }}>
            Please note, due to the following countries regulatory environments for token sales, we regret that we cannot
            accommodate participants from the following countries: <b>USA, China, North Korea, Syria, Guinea-Bissau, Iraq,
            Tajikistan, Afghanistan, North Korea, Cuba, Syria, the Re public of Sudan and Crimea.</b>
          </p>

          <p style={{ lineHeight: '1.5em' }}>
            We would like to emphasize that you are participating in this sale at your own risk. We do not promise a return on your
            commitment. The crypto environment can be both volatile and hostile - please ensure you take the appropriate
            security steps to ensure your funds are safe.
          </p>

          <p style={{ lineHeight: '1.5em' }}>
            Polkadot will <b>not</b> provide any customer support for the registration process.
            By participating in the sale, you assume full responsibility for your funds.
          </p>
        </div>

        <Button primary size='big' onClick={this.handleStart}>
          Start
        </Button>
      </div>
    );
  }

  handleStart = () => {
    appStore.goto('terms');
  };
}
