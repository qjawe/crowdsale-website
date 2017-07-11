import { createStore } from 'redux';

const STATUS_UPDATE = Symbol('STATUS_UPDATE');
const TIME_TICK = Symbol('TIME_TICK');

const actions = {
  [STATUS_UPDATE] (state, status) {
    const {
      block,
      time,
      price,
      available,
      cap,
      connected,
      begin,
      end,
    } = status;

    const timeLeft = Math.max(0, end - time);

    return Object.assign({}, state, {
      block,
      time,
      price,
      available,
      cap,
      connected,
      begin,
      end,
      timeLeft
    });
  },

  [TIME_TICK] (state, timeLeft) {
    return Object.assign({}, state, { timeLeft });
  }
};

export function statusUpdate (status) {
  return {
    type: STATUS_UPDATE,
    value: status
  };
}

export function timeTick (timeLeft) {
  return {
    type: TIME_TICK,
    value: timeLeft
  };
}

const initialState = {
  block: 0,
  current: 0,
  begin: 0,
  end: 0,
  timeLeft: 0,
  price: 0,
  available: 0,
  cap: 0,
  connected: 'disconnected'
};

function sale(state = initialState, { type, value }) {
  if (type in actions) {
    return actions[type](state, value);
  }

  return state;
}

export default createStore(sale);
