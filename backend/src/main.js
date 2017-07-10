'use strict';

const Koa = require('koa');
const app = new Koa();
const Sale = require('./sale');

const sale = new Sale('ws://127.0.0.1:8546/', '0x5a96e89850ea6c495017dba467643712b0cace86');

app.use((ctx) => {
  console.log('Incoming request!');

  const {block, price, begin, end, status} = sale;

  ctx.body = `Hello, Sale!

  Block number: ${block}
  Current price: ${price}
  Begin time: ${new Date(begin * 1000)}
  End time: ${new Date(end * 1000)}
  Status: ${sale.status.toUpperCase()}`;
});

app.listen(3000);
