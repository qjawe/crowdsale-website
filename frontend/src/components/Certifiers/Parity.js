import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Button, Form, Header, Message, Modal } from 'semantic-ui-react';

import certifierStore from '../../stores/certifier.store';

@observer
export default class ParityCertifier extends Component {
  render () {
    const { error, firstName, lastName, loading } = certifierStore;

    return (
      <Modal
        basic
        closeIcon='close'
        open
        onClose={this.handleClose}
      >
        <Header content='VERIFYING WITH PARITY' />
        <Modal.Content>
          <Form
            error={!!error}
            inverted
          >
            {this.renderError()}
            <Form.Field>
              <Form.Input
                label='First Name'
                onChange={this.handleFirstNameChange}
                placeholder='First Name'
              />
            </Form.Field>
            <Form.Field>
              <Form.Input
                label='Last Name'
                onChange={this.handleLastNameChange}
                placeholder='Last Name'
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            disabled={!firstName || !lastName || loading}
            loading={loading}
            onClick={this.handleNext}
            inverted
          >
            {
              loading
              ? 'Loading...'
              : 'Next'
            }
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  renderError () {
    const { error } = certifierStore;

    if (!error) {
      return null;
    }

    return (
      <Message
        error
        header='Error'
        content={error.message}
      />
    );
  }

  handleFirstNameChange = (event) => {
    const firstName = event.target.value;

    certifierStore.setFirstName(firstName);
  };

  handleLastNameChange = (event) => {
    const lastName = event.target.value;

    certifierStore.setLastName(lastName);
  };

  handleNext = () => {
    certifierStore.createApplicant();
  };
}
