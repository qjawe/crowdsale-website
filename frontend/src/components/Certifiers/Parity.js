import { countries } from 'country-data';
import { uniq } from 'lodash';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Button, Form, Header, Message, Modal } from 'semantic-ui-react';

import certifierStore from '../../stores/certifier.store';

const COUNTRIES_BLACKLIST = [
  'JPN'
];

const countryCodes = countries.all
  .filter((c) => c.status === 'assigned')
  .filter((c) => !COUNTRIES_BLACKLIST.includes(c.alpha3))
  .map((c) => c.alpha3);

const countryOptions = uniq(countryCodes)
  .map((code) => {
    const country = countries[code];

    return {
      key: country.alpha2,
      text: country.name,
      value: country.alpha3,
      flag: country.alpha2.toLowerCase()
    };
  })
  .sort((cA, cB) => cA.text.localeCompare(cB.text));

const CountryDropdown = (props) => {
  return (
    <Form.Dropdown
      label='Country'
      placeholder='Select Country'
      fluid
      search
      selection
      options={countryOptions}
      onChange={props.onChange}
      value={props.value}
    />
  );
};

CountryDropdown.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired
};

@observer
export default class ParityCertifier extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired
  };

  componentWillUnmount () {
    certifierStore.unmountOnfido();
  }

  render () {
    const { country, error, firstName, lastName, loading, onfido } = certifierStore;
    const { onClose } = this.props;

    if (onfido) {
      return this.renderOnfidoForm();
    }

    return (
      <Modal
        basic
        closeIcon='close'
        open
        onClose={onClose}
        closeOnDimmerClick={false}
      >
        <Header content='VERIFYING WITH PARITY' />
        <Modal.Content>
          <Form
            error={!!error}
            inverted
          >
            {this.renderError()}
            <Form.Field>
              <CountryDropdown
                onChange={this.handleCountryChange}
                value={country}
              />
            </Form.Field>

            <Form.Field>
              <Form.Input
                label='First Name'
                onChange={this.handleFirstNameChange}
                placeholder='First Name'
                value={firstName}
              />
            </Form.Field>
            <Form.Field>
              <Form.Input
                label='Last Name'
                onChange={this.handleLastNameChange}
                placeholder='Last Name'
                value={lastName}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            disabled={!firstName || !lastName || !country || loading}
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

  renderOnfidoForm () {
    const { onClose } = this.props;

    return (
      <Modal
        basic
        closeIcon='close'
        open
        onClose={onClose}
      >
        <Modal.Content>
          {this.renderError()}
          <div id='onfido-mount' ref={this.handleSetOnfidoElt} />
        </Modal.Content>
      </Modal>
    );
  }

  handleCountryChange = (_, data) => {
    const { value } = data;

    certifierStore.setCountry(value);
  };

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

  handleSetOnfidoElt = () => {
    certifierStore.mountOnfido();
  }
}
