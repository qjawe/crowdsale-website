import { createStore } from 'redux';

const actions = {};

function action (handler) {
  const type = Symbol();

  actions[type] = handler;

  return (value) => ({ type, value });
}

export const statusUpdate = action((state, status) => {
  const {
    contractAddress,
    statementHash,
    buyinId,
    block,
    price,
    available,
    cap,
    connected,
    begin,
    end,
    bonusDuration,
    bonusSize,
    currentTime
  } = status;

  const timeLeft = Math.max(0, end - block.timestamp);

  return Object.assign({}, state, {
    contractAddress,
    statementHash,
    buyinId,
    block,
    price,
    available,
    cap,
    connected,
    begin,
    end,
    bonusDuration,
    bonusSize,
    currentTime,
    timeLeft
  });
});

export const timeTick = action((state, timeLeft) => {
  return Object.assign({}, state, { timeLeft });
});

const initialState = {
  contractAddress: '0x',
  statementHash: '0x',
  buyinId: '0x',
  block: 0,
  current: 0,
  begin: 0,
  end: 0,
  timeLeft: 0,
  price: 0,
  available: 0,
  cap: 0,
  bonusDuration: 0,
  bonusSize: 0,
  currentTime: 0,
  connected: 'disconnected'
};

function sale (state = initialState, { type, value }) {
  if (type in actions) {
    return actions[type](state, value);
  }

  return state;
}

export default createStore(sale);
