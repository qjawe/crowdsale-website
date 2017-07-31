import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Checkbox, Header, Segment } from 'semantic-ui-react';

import TermsMD from '../terms.md';

import buyStore from '../stores/buy.store';

@observer
export default class Terms extends Component {
  render () {
    const { termsAccepted } = buyStore;

    return (
      <Segment basic textAlign='center'>
        <Header
          as='h4'
        >
          Terms & Conditions
        </Header>
        <Segment basic textAlign='left' style={{
          maxHeight: 200,
          marginBottom: '2em',
          overflow: 'auto'
        }}>
          <TermsMD />
        </Segment>
        <Checkbox
          label={`
            I agree to have these Terms and Conditions
            signed my behalf using my private key.
          `}
          checked={termsAccepted}
          onChange={this.handleTermsChecked}
        />
      </Segment>
    );
  }

  handleTermsChecked = (_, { checked }) => {
    buyStore.setTermsAccepted(checked);
  };
}
