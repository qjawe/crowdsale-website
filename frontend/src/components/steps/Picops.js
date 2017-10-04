import React, { Component } from 'react';
import { iframeResizer } from 'iframe-resizer';
// import { Portal } from 'semantic-ui-react';

import accountStore from '../../stores/account.store';
import { PICOPS_BASE_URL } from '../../backend';

export default class Picops extends Component {
  componentWillMount () {
    accountStore.watchCertification();
    window.addEventListener('message', this.listener, false);
  }

  componentWillUnmount () {
    if (this.iframe) {
      this.iframe.iFrameResizer.close();
    }

    accountStore.unwatchCertification();
    window.removeEventListener('message', this.listener, false);
  }

  render () {
    const { address } = accountStore;

    return (
      <iframe
        frameBorder={0}
        src={`${PICOPS_BASE_URL}/?no-padding&no-stepper&terms-accepted&paid-for=${address}`}
        style={{
          height: '500px',
          width: '100%',
          position: 'relative',
          bottom: 0,
          left: 0,
          right: 0,
          top: 0
        }}
        onLoad={this.iFrameResize}
        ref={this.setIframeRef}
        scrolling='no'
      />
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
      console.warn('requesting to sign', message.message);
      this.handleSignMessage(message.message, event.source, event.origin);
    }
  };

  handleSignMessage = (message, source, origin) => {
    const signature = accountStore.signMessage(message);

    console.warn('sending signature', message, signature);
    source.postMessage(JSON.stringify({
      action: 'signature',
      signature
    }), origin);
  };

  iFrameResize = () => {
    if (!this.iframe) {
      return;
    }

    iframeResizer({
      log: false,
      heightCalculationMethod: 'taggedElement'
    }, this.iframe);
  };

  setIframeRef = (iframe) => {
    this.iframe = iframe;
  };
}
