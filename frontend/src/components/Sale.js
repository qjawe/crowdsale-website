import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Button, Container, Dimmer, Divider, Header, Icon, Loader, Segment } from 'semantic-ui-react';

import AccountManager from './AccountManager';
import Buy from './Buy';
import Terms from './Terms';
import WalletCreator from './WalletCreator';

import accountStore from '../stores/account.store';
import appStore, { STEPS } from '../stores/app.store';
import certifierStore from '../stores/certifier.store';

@observer
export default class Sale extends Component {
  render () {
    const { unlocked, wallet } = accountStore;
    const { step } = appStore;

    if (unlocked) {
      return this.renderBuy();
    }

    if (wallet || step === STEPS['load-wallet']) {
      return this.renderLoadWallet();
    }

    if (step === STEPS['create-wallet']) {
      return this.renderCreateWallet();
    }

    if (step === STEPS['home']) {
      return this.renderHome();
    }

    return null;
  }

  renderBuy () {
    const { error, pending } = certifierStore;

    return (
      <Segment basic>
        <Dimmer active={pending || !!error} inverted>
          {this.renderDimmerContent()}
        </Dimmer>

        <Terms />
        <AccountManager />
        <Buy />
      </Segment>
    );
  }

  renderDimmerContent () {
    const { error, onfido, pending } = certifierStore;

    if (pending) {
      return (
        <Loader>
          <Header>We are currently verifying your identity...</Header>
        </Loader>
      );
    }

    if (error) {
      return (
        <Container textAlign='center'>
          <Header as='h3' textAlign='center' color='red'>
            <Icon name='warning circle' color='red' />
            {error.message}
          </Header>

          {
            onfido
            ? (
              <div>
                <Header as='h4'>
                  If this issue remains, please contact us with this
                  information:
                </Header>
                <div>
                  <pre style={{ color: 'black', fontSize: '0.85rem', overflow: 'visible' }}>
                    {onfido.checkId}@{onfido.applicantId}
                  </pre>
                </div>
              </div>
            )
            : null
          }

          <br />

          <Button
            onClick={this.handleCloseError}
            primary
          >
            Close
          </Button>
        </Container>
      );
    }

    return null;
  }

  renderHome () {
    return (
      <Container textAlign='center'>
        <Header as='h3'>
          <Divider horizontal>
            GET STARTED
          </Divider>
        </Header>
        <p>
          Please note we require participants in the auction to verify
          their identity in compliance with OFAC requgulation, read
          more <a>here</a>.
        </p>

        <div>
          <Button
            onClick={this.handleLoadWallet}
            primary
          >
            Load wallet file
          </Button>

          <Button
            onClick={this.handleNoWallet}
          >
            I don&apos;t have a wallet
          </Button>
        </div>
      </Container>
    );
  }

  renderLoadWallet () {
    return (
      <Container textAlign='center'>
        <Header as='h3'>
          <Divider horizontal>
            GET STARTED
          </Divider>
        </Header>
        <AccountManager />
      </Container>
    );
  }

  renderCreateWallet () {
    return (
      <Container>
        <WalletCreator />
      </Container>
    );
  }

  handleLoadWallet = () => {
    appStore.goto('load-wallet');
  };

  handleNoWallet = () => {
    appStore.goto('create-wallet');
  };

  handleCloseError = () => {
    certifierStore.reset();
  };
}
