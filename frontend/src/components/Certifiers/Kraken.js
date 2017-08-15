import PropTypes from 'proptypes';
import React, { Component } from 'react';
import { Button, Header, Modal } from 'semantic-ui-react';

export default class KrakenCertifier extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired
  };

  render () {
    const { onClose } = this.props;

    return (
      <Modal
        basic
        open
        onClose={this.handleClose}
      >
        <Header content='VERIFYING WITH KRAKEN' />
        <Modal.Content>
          <p>
            In order to verify your identity with Kraken, please
            follow this <a target='_blank' href='https://kraken.com/'>link</a>.
          </p>
          <p>
            Once the verification is completed, it can take up to a
            few minutes for your account to be verified. Please be patient!
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={onClose}
            inverted
          >
            Close
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}
