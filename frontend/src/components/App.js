import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Header, Loader } from 'semantic-ui-react';

import AppContainer from './AppContainer';
import ImportantNotice from './steps/ImportantNotice';
import Start from './steps/Start';
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

    if (step === STEPS['important-notice']) {
      return (
        <ImportantNotice />
      );
    }

    if (step === STEPS['start']) {
      return (
        <Start />
      );
    }

    return null;
  }

  handleRestart = () => {
    appStore.restart();
  };
}
