import React, { Component } from 'react';
import { Portal } from 'semantic-ui-react';

import accountStore from '../../stores/account.store';

export default class Picops extends Component {
  componentWillMount () {
    accountStore.watchCertification();
  }

  componentWillUnmount () {
    accountStore.unwatchCertification();
  }

  render () {
    return (
      <Portal open>
        <iframe frameBorder={0} src='https://staging-picops.parity.io/' style={{
          height: '100%',
          width: '100%',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          top: 0
        }} />
      </Portal>
    );
  }
}
