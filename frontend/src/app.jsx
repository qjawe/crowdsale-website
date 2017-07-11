import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formatUnit } from './utils';

const WEI_IN_ETH = 1000000000000000000;

function mapStateToProps (state) {
  const { block, price, available, cap, timeLeft } = state;

  return { block, price, available, cap, timeLeft };
}

function App (props) {
  const { timeLeft } = props;

  const days = timeLeft / 86400 | 0;
  const hours = (timeLeft % 86400) / 3600 | 0;
  const minutes = (timeLeft % 3600) / 60 | 0;
  const seconds = timeLeft % 60;

  const timeLeftParts = [];

  const atLeastDay = timeLeft > 86400;
  const atLeastHour = timeLeft > 3600;
  const atLeastMinute = timeLeft > 60;

  if (timeLeft >= 86400) {
      timeLeftParts.push(formatUnit(days, 'day'));
  }
  if (timeLeft >= 3600) {
      timeLeftParts.push(formatUnit(hours, 'hour'));
  }
  if (timeLeft >= 60) {
      timeLeftParts.push(formatUnit(minutes, 'minute'));
  }
  timeLeftParts.push(formatUnit(seconds, 'second'));

  return (
    <div style={ { fontFamily: 'monospace' } }>
      <h1>Price: Ξ{ props.price / WEI_IN_ETH }</h1>
      <p>Block: { props.block } | Tokens available: { props.available } / { props.cap }</p>
      <p>At current price the sale will end in { timeLeftParts.join(' ') }</p>
    </div>
  );
}

export default connect(mapStateToProps, null)(App);
