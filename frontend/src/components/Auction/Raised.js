import { observer } from 'mobx-react';
import React, { Component } from 'react';

import auctionStore from '../../stores/auction.store';

const LINE_SIZE = 2;
const DOTS_SIZE = 20;
const CIRCLE_SIZE = 6;
const INNER_CIRCLE_SIZE = CIRCLE_SIZE * 0.8;
const BG_COLOR = '#4d4d4d';

const containerStyle = {
  margin: '1em auto',
  height: `${CIRCLE_SIZE}rem`,
  position: 'relative',
  width: '75%'
};

const dotStyle = {
  backgroundColor: BG_COLOR,
  borderRadius: '50%',
  height: DOTS_SIZE,
  position: 'absolute',
  top: `calc(${CIRCLE_SIZE / 2}rem - ${DOTS_SIZE / 2}px)`,
  width: DOTS_SIZE
};

const lineStyle = {
  backgroundColor: BG_COLOR,
  height: LINE_SIZE,
  left: 0,
  position: 'absolute',
  top: `calc(${CIRCLE_SIZE / 2}rem - ${(LINE_SIZE) / 2}px)`,
  right: 0
};

const outerCircleStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `${LINE_SIZE}px solid ${BG_COLOR}`,
  borderRadius: '50%',
  position: 'absolute',
  height: `${CIRCLE_SIZE}rem`,
  width: `${CIRCLE_SIZE}rem`
};

const innerCircleStyle = {
  backgroundColor: BG_COLOR,
  borderRadius: '50%',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
  textAlign: 'center',
  height: `${INNER_CIRCLE_SIZE}rem`,
  width: `${INNER_CIRCLE_SIZE}rem`
};

@observer
export default class Raised extends Component {
  render () {
    const { available, cap } = auctionStore;
    const ratio = 1 - available.div(cap).toNumber();
    const percentage = ratio * 100;
    const edges = `calc(${DOTS_SIZE}px + ${CIRCLE_SIZE / 2}rem)`;
    const circleCenter = `calc(${percentage}% + ${edges} - 2*${ratio}*${edges})`;
    const circleLeft = `calc(${circleCenter} - ${CIRCLE_SIZE / 2}rem)`;

    return (
      <div style={containerStyle}>
        <div style={Object.assign({}, dotStyle, { left: 0 })} />
        <div style={lineStyle} />
        <div style={Object.assign({}, dotStyle, { right: 0 })} />
        <div style={Object.assign({}, outerCircleStyle, { left: circleLeft })}>
          <div style={innerCircleStyle}>
            {Math.round(percentage)}%
          </div>
        </div>
      </div>
    );
  }
}
