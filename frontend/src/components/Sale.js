import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Container, Button, Header } from 'semantic-ui-react';
import { phraseToWallet } from '@parity/ethkey.js';
import { randomPhrase } from '@parity/wordlist';

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
    step: STEPS.HOME,
    phrase: null,
    address: null
  };

  render () {
    const { unlocked, wallet } = accountStore;
    const { step } = this.state;

    if (unlocked) {
      return this.renderBuy();
    }

    if (wallet || step === STEPS.LOAD_WALLET) {
      return this.renderLoadWallet();
    }

    if (step === STEPS.CREATE_WALLET) {
      return this.renderCreateWallet();
    }

    if (step === STEPS.HOME) {
      return this.renderHome();
    }

    return null;
  }

  renderBuy () {
    return (
      <div>
        <Terms />
        <AccountManager />
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

  renderCreateWallet () {
    if (this.state.phrase == null) {
      const phrase = randomPhrase(12);

      phraseToWallet(phrase)
        .then(({ address, secret }) => {
          accountStore.create(secret);

          this.setState({ phrase, address });
        });

      return null;
    }

    const { phrase, address } = this.state;

    return (
      <div>
        <div>Address: {address}</div>
        <div>Phrase: {phrase}</div>
      </div>
    );
  }

  handleLoadWallet = () => {
    this.setState({ step: STEPS.LOAD_WALLET });
  };

  handleNoWallet = () => {
    this.setState({ step: STEPS.CREATE_WALLET });
  };
}
