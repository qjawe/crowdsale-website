import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Checkbox, Header, Segment } from 'semantic-ui-react';

import TermsMD from '../terms.md';

import buyStore from '../stores/buy.store';

@observer
export default class Terms extends Component {
  render () {
    const { notFromJapan, termsAccepted } = buyStore;

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
            Please tick to confirm you have read and agree to
            the Terms and Conditions of this Auction
          `}
          checked={termsAccepted}
          onChange={this.handleTermsChecked}
        />
        <Checkbox
          label={`
            Please tick to confirm you are not a citizen of Japan
          `}
          checked={notFromJapan}
          onChange={this.handleNotFromJapanChecked}
          style={{ marginTop: '0.5em' }}
        />
      </Segment>
    );
  }

  handleTermsChecked = (_, { checked }) => {
    buyStore.setTermsAccepted(checked);
  };

  handleNotFromJapanChecked = (_, { checked }) => {
    buyStore.setNotFromJapan(checked);
  };
}
