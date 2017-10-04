import React, { Component } from 'react';
import { iframeResizer } from 'iframe-resizer';

import { PICOPS_BASE_URL } from '../../backend';
import appStore from '../../stores/app.store';

export default class PicopsTerms extends Component {
  componentWillMount () {
    window.addEventListener('message', this.listener, false);
  }

  componentWillUnmount () {
    if (this.iframe) {
      // this.iframe.iFrameResizer.close();
    }

    window.removeEventListener('message', this.listener, false);
  }

  render () {
    return (
      <iframe
        frameBorder={0}
        src={`${PICOPS_BASE_URL}/#/tc`}
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

    try {
      message = JSON.parse(event.data);
    } catch (error) {
      return console.warn('could not parse JSON', event.data);
    }

    if (message.action !== 'terms-accepted') {
      return;
    }

    if (!message.termsAccepted) {
      return;
    }

    appStore.goto('contribute');
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
