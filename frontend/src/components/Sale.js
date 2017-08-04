import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Container, Button, Header } from 'semantic-ui-react';

import AccountManager from './AccountManager';
import Buy from './Buy';
import Terms from './Terms';

import accountStore from '../stores/account.store';

const STEPS = {
  HOME: Symbol(),
  LOAD_WALLET: Symbol(),
  CREATE_WALLET: Symbol()
};

@observer
export default class Sale extends Component {
  state = {
    step: STEPS.HOME
  };

  render () {
    const { unlocked } = accountStore;
    const { step } = this.state;

    if (unlocked) {
      return this.renderBuy();
    }

    if (step === STEPS.HOME) {
      return this.renderHome();
    }

    if (step === STEPS.LOAD_WALLET) {
      return this.renderLoadWallet();
    }

    return null;
  }

  renderBuy () {
    return (
      <div>
        <AccountManager />
        <Terms />
        <Buy />
      </div>
    );
  }

  renderHome () {
    return (
      <Container textAlign='center'>
        <Header as='h3'>
          GET STARTED
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
            I don't have a wallet
          </Button>
        </div>
      </Container>
    );
  }

  renderLoadWallet () {
    return (
      <Container textAlign='center'>
        <Header as='h3'>
          GET STARTED
        </Header>
        <AccountManager />
      </Container>
    );
  }

  handleLoadWallet = () => {
    this.setState({ step: STEPS.LOAD_WALLET });
  };

  handleNoWallet = () => {
    this.setState({ step: STEPS.CREATE_WALLET });
  };
}
