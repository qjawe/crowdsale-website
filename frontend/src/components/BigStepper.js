import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { Container, Icon, Responsive, Segment } from 'semantic-ui-react';

import appStore from '../stores/app.store';

const containerStyle = {
  backgroundColor: 'white',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  padding: '0',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between'
};

@observer
export default class BigStepper extends Component {
  render () {
    const current = appStore.stepper;
    const steps = [
      { name: 'Confirm Eligibility' },
      { name: 'Load / Generate Wallet' },
      { name: 'Contribute to the auction' }
    ];

    const elements = steps.reduce((elements, step, index) => {
      const last = index === steps.length - 1;
      const done = index <= current;

      elements.push(this.renderStep(step, index, done, last));

      if (!last) {
        elements.push(this.renderArrow(index));
      }

      return elements;
    }, []);

    return (
      <div style={{
        backgroundColor: 'white'
      }}>
        <Responsive as={Container} {...Responsive.onlyComputer} style={{
          padding: 0
        }}>
          {this.renderLarge(elements)}
        </Responsive>
        <Responsive as={Container} maxWidth={Responsive.onlyComputer.minWidth} style={{
          padding: 0
        }}>
          {this.renderSmall(elements)}
        </Responsive>
      </div>
    );
  }

  renderLarge (elements) {
    return (
      <div style={containerStyle}>
        {elements}
      </div>
    );
  }

  renderSmall (elements) {
    const style = Object.assign({}, containerStyle, {
      flexDirection: 'column'
    });

    return (
      <div style={style}>
        <div>
          {elements}
        </div>
      </div>
    );
  }

  renderArrow (index) {
    return (
      <Responsive
        as={Segment}
        basic {...Responsive.onlyComputer}
        key={`arrow_${index}`}
        style={{
          margin: '1em 0.5em',
          fontSize: '1.5em',
          padding: 0
        }}
      >
        <Icon name='angle right' size='large' />
      </Responsive>
    );
  }

  renderStep (step, index, done, last) {
    const bg = done
      ? '#4D4D4D'
      : '#F2F2F1';

    const color = done
      ? '#FFFFFF'
      : '#020202';

    return (
      <div key={index} style={{
        display: 'flex',
        fontSize: '1.5em',
        lineHeight: '1.5em',
        alignItems: 'center',
        margin: '1em 0',
        marginRight: last ? '0' : '0.5em',
        fontWeight: '200'
      }}>
        <div style={{
          backgroundColor: bg,
          color: color,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '1.5em',
          width: '1.5em',
          fontSize: '1.5em',
          marginRight: '0.5em',
          flex: '0 0 auto'
        }}>{index + 1}</div>
        <div>
          {step.name}
        </div>
      </div>
    );
  }
}
