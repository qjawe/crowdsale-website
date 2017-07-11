import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './app';
import { get } from './utils';
import store, { statusUpdate, timeTick } from './store';

update();

setInterval(() => {
  const time = new Date() / 1000 | 0;
  const { end } = store.getState();
  const timeLeft = Math.max(0, end - time);

  store.dispatch(timeTick(timeLeft));
}, 1000);

async function update () {
  const status = await get('http://localhost:4000/');
  const { time, end } = status;

  status.timeLeft = Math.max(0, end - time);

  store.dispatch(statusUpdate(status));

  setTimeout(update, 5000);
}

render(
  <Provider store={ store }>
    <App/>
  </Provider>,
  document.getElementById('app')
);
