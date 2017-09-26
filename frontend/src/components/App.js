import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { HashRouter as Router, Link, Route } from 'react-router-dom';
import { Button, Header, Loader } from 'semantic-ui-react';

import AppContainer from './AppContainer';
import Messages from './Messages';

import appStore, { STEPS } from '../stores/app.store';

@observer
export default class App extends Component {
  render () {
    return (
      <Router>
        <div>
          <Route exact path='/' component={MainApp} />
          <Messages />
        </div>
      </Router>
    );
  }
}

@observer
class MainApp extends Component {
  render () {
    return (
      <AppContainer
        footer={this.renderFooter()}
        title='PARITY CROWDSALE MODULE'
      >
        {this.renderContent()}
      </AppContainer>
    );
  }

  renderContent () {
    const { loading, step } = appStore;

    if (loading) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Loader active inline='centered' size='huge' />

          <Header as='h2'>
            Loading data...
          </Header>
        </div>
      );
    }

    if (step === STEPS['start']) {
      return this.renderStart();
    }

    return null;
  }

  renderFooter () {
    const { step } = appStore;

    if (step !== STEPS['start']) {
      return null;
    }

    return (
      <div style={{ textAlign: 'right', paddingTop: '0.75em' }}>
        <Link
          to='/details'
          style={{ color: 'gray', fontSize: '1.75em' }}
        >
          Learn More
        </Link>
      </div>
    );
  }

  renderStart () {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Header as='h2'>
          HEADER
        </Header>

        <div style={{
          fontSize: '1em',
          margin: '2em 0 3em',
          maxWidth: '600px'
        }}>
          <p style={{ lineHeight: '1.5em' }}>
            Welcome to the...
          </p>
        </div>

        <Button primary size='big' onClick={this.handleStart}>
          Start
        </Button>
      </div>
    );
  }

  handleRestart = () => {
    appStore.restart();
  };

  handleStart = () => {
    appStore.goto('terms');
  };
}
