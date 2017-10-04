import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Container, Header, Segment } from 'semantic-ui-react';

import appStore, { STEPS } from '../stores/app.store';
import BigStepper from './BigStepper.js';
import Stepper from './Stepper';

const baseContentStyle = {
  backgroundColor: 'white',
  padding: '4em 2.5em'
};

@observer
export default class AppContainer extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,

    footer: PropTypes.node,
    header: PropTypes.node,
    style: PropTypes.object
  };

  static defaultProps = {
    padded: true,
    style: {}
  };

  render () {
    return (
      <div>
        <div style={{ paddingTop: '4em' }}>
          <BigStepper />
        </div>
        {this.renderContent()}
      </div>
    );
  }

  renderContent () {
    const { children, header, footer } = this.props;

    if (appStore.step === STEPS['picops']) {
      return (
        <div>
          <Container>
            <Header as='h4' style={{ marginTop: '2em', marginBottom: '1em' }}>
              IDENTITY VERIFICATION
            </Header>
          </Container>
          {children}
        </div>
      );
    }

    const style = {
      textAlign: 'left'
    };
    const { view } = appStore;
    const contentStyle = Object.assign({}, baseContentStyle, this.props.style);
    const titleNode = view && view.title
      ? <Header as='h4' style={{ marginTop: '2em' }}>{view.title}</Header>
      : <div style={{ marginTop: '6em' }} />;

    return (
      <Container style={style}>
        {titleNode}
        {header || null}
        {this.renderStepper()}
        <Segment basic style={contentStyle}>
          {children}
        </Segment>
        {footer || null}
      </Container>
    );
  }

  renderStepper () {
    const { view } = appStore;

    if (!view) {
      return null;
    }

    return (
      <Stepper
        step={view.step}
        steps={view.steps}
      />
    );
  }
}
