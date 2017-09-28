import React, { Component } from 'react';
import { Portal } from 'semantic-ui-react';

import accountStore from '../../stores/account.store';

export default class Picops extends Component {
  componentWillMount () {
    accountStore.watchCertification();
    window.addEventListener('message', this.listener, false);
  }

  componentWillUnmount () {
    accountStore.unwatchCertification();
    window.removeEventListener('message', this.listener, false);
  }

  render () {
    const { address } = accountStore;

    return (
      <Portal open>
        <iframe
          frameBorder={0}
          src={`https://staging-picops.parity.io/?no-padding&no-stepper&terms-accepted&paid-for=${address}`}
          style={{
            height: '100%',
            width: '100%',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            top: 0
          }}
        />
      </Portal>
    );
  }

  listener = (event) => {
    let message;

    console.warn('message', event);

    try {
      message = JSON.parse(event.data);
    } catch (error) {
      return console.warn('could not parse JSON', event.data);
    }

    if (message.action === 'request-signature') {
      this.handleSignMessage(message.message, event.source, event.origin);
    }
  };

  handleSignMessage = (message, source, origin) => {
    const signature = accountStore.signMessage(message);

    source.postMessage({
      action: 'signature',
      signature
    }, origin);
  };
}
