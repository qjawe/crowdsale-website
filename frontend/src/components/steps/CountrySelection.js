import { countries } from 'country-data';
import Datamap from 'datamaps';
import React, { Component } from 'react';
import { Button, Card, Header, Icon, Modal } from 'semantic-ui-react';

import appStore from '../../stores/app.store';

const VALID_COLOR = '#4a90e2';
const INVALID_COLOR = '#4d4d4d';
const BACKGROUND_COLOR = '#f2f2f2';

const mapStyle = {
  backgroundColor: BACKGROUND_COLOR,
  // height: 400,
  // margin: '0 2em 1em',
  padding: '1.5em 1em',
  borderRadius: '1em'
};

const panelStyle = {
  flex: 1,
  margin: '0 2em'
};

export default class CountrySelection extends Component {
  state = {
    showInvalidModal: false
  };

  componentWillMount () {
    this.blacklistedCountriesNames = appStore.blacklistedCountries
      .map((countryKey) => countries[countryKey].name);

    this.mapData = appStore.blacklistedCountries
      .reduce((data, countryKey) => {
        data[countryKey] = { fillKey: 'DISABLED' };
        return data;
      }, {});

    window.addEventListener('resize', this.resize);
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resize);
  }

  render () {
    return (
      <div>
        <Header as='h2' textAlign='center'>
          CHOOSE YOUR CITIZENSHIP
        </Header>

        {this.renderModal()}

        <p style={{ textAlign: 'center', margin: '2em 0 0' }}>
          Are you a citizen of or otherwise resident or established in
          one of those countries: {this.renderCountryList()}?
        </p>

        <div style={{ display: 'flex', width: '100%', marginTop: '4em' }}>
          <div style={panelStyle}>
            <Card fluid link style={mapStyle} onClick={this.handleInvalid}>
              <div ref={this.setInvalidRef} />
            </Card>

            <div style={{ textAlign: 'center' }}>
              <b>YES</b>
            </div>
          </div>

          <div style={panelStyle}>
            <Card fluid link style={mapStyle} onClick={this.handleValid}>
              <div ref={this.setValidRef} />
            </Card>

            <div style={{ textAlign: 'center' }}>
              <b>NO</b>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderCountryList () {
    const list = this.blacklistedCountriesNames;

    if (list.length <= 2) {
      return list.join(' and ');
    }

    return `${list.slice(0, -1).join(', ')} and ${list.slice(-1)[0]}`;
  }

  renderModal () {
    const { showInvalidModal } = this.state;

    return (
      <Modal
        basic
        open={showInvalidModal}
        onClose={this.handleCloseInvalid}
        size='small'
      >
        <Header icon='world' content='EXCLUDED COUNTRIES' />
        <Modal.Content>
          <p style={{ fontSize: '1.15em' }}>
            We apologize that you are unable to participate in the sale.
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button inverted onClick={this.handleCloseInvalid}>
            <Icon name='close' /> Close
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  resize = () => {
    if (!this.invalidMap || !this.validMap) {
      return;
    }

    this.invalidMap.resize();
    this.validMap.resize();
  };

  createMap = (element, invalid = false) => {
    return new Datamap({
      projection: 'mercator',
      geographyConfig: {
        highlightOnHover: false,
        popupOnHover: false
      },
      fills: {
        defaultFill: invalid ? INVALID_COLOR : VALID_COLOR,
        DISABLED: invalid ? VALID_COLOR : INVALID_COLOR
      },
      responsive: true,
      data: this.mapData,
      element
    });
  };

  handleCloseInvalid = () => {
    this.setState({ showInvalidModal: false });
  };

  handleInvalid = () => {
    this.setState({ showInvalidModal: true });
  };

  handleValid = () => {
    appStore.storeValidCitizenship();
    appStore.goto('account-selection');
  };

  setInvalidRef = (element) => {
    if (!element) {
      return;
    }

    this.invalidMap = this.createMap(element, true);
  };

  setValidRef = (element) => {
    if (!element) {
      return;
    }

    this.validMap = this.createMap(element, false);
  };
}
