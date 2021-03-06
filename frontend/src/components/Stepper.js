import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from 'semantic-ui-react';

const containerStyle = {
  position: 'absolute',
  top: '-1.25em',
  left: 0,
  right: 0
};

const stepNameStyle = {
  position: 'absolute',
  marginLeft: '-75px',
  left: '0.75em',
  top: '-5.5em',
  width: '150px',
  textAlign: 'center',
  height: '4.5em',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  fontSize: '1.1em'
};

export default class Stepper extends Component {
  static propTypes = {
    steps: PropTypes.object.isRequired,
    step: PropTypes.number.isRequired
  };

  render () {
    const { step, steps } = this.props;

    if (step < 0) {
      return null;
    }

    const count = steps.length - 1;

    return (
      <div style={{
        padding: '1em 50px',
        height: '7em',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }}>
        <div style={{
          width: '92%',
          height: '1px',
          position: 'relative',
          backgroundColor: 'lightgray',
          fontSize: '0.9em',
          top: '-1em',
          margin: '0 auto'
        }}>
          <div style={containerStyle}>
            {steps.map((title, index) => this.renderStep(title, index, count))}
          </div>
        </div>
      </div>
    );
  }

  renderStep (title, index, count) {
    const { step } = this.props;
    const position = Math.round(100 * index / count);

    const color = index <= step
      ? '#21ba45'
      : 'lightgray';

    const icon = index <= step
      ? 'check'
      : undefined;

    return (
      <div
        key={`${title}-${index}`}
        style={{ position: 'absolute', left: `calc(${position}% - 0.75em)`, top: '0.5em' }}
      >
        <Icon
          circular
          name={icon}
          size='small'
          style={{
            backgroundColor: color,
            boxShadow: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 !important'
          }}
        />
        <div style={stepNameStyle}>
          <span>{title}</span>
        </div>
      </div>
    );
  }
}
