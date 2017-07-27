import BigNumber from 'bignumber.js';
import { action, computed, observable } from 'mobx';

import backend from '../backend';
import { fromWei } from '../utils';

const REFRESH_DELAY = 2000;

class AuctionStore {
  @observable available = new BigNumber(0);
  @observable begin = 0;
  @observable block = 0;
  @observable bonusDuration = 0;
  @observable bonusSize = new BigNumber(0);
  @observable buyinId = '0x';
  @observable cap = new BigNumber(0);
  @observable chart = {};
  @observable connected = 'disconnected'
  @observable contractAddress = '0x';
  @observable currentTime = 0;
  @observable divisor = new BigNumber(1);
  @observable end = 0;
  @observable price = new BigNumber(0);
  @observable statementHash = '0x';
  @observable timeLeft = 0;
  @observable totalReceived = new BigNumber(0);

  USDWEI = new BigNumber(10).pow(18).div(200);

  constructor () {
    this.refresh();

    setInterval(() => {
      this.refresh();
    }, REFRESH_DELAY);
  }

  bonus (value) {
    if (!this.isActive() || !this.inBonus) {
      return new BigNumber(0);
    }

    return value.mul(this.bonusSize).div(100);
  }

  getPrice (_time) {
    if (!this.isActive()) {
      return new BigNumber(0);
    }

    const time = new BigNumber(_time).round();
    const { begin, divisor, USDWEI } = this;

    return USDWEI
      .mul(new BigNumber(18432000).div(time.sub(begin).add(5760)).sub(5))
      .div(divisor)
      .round();
  }

  getTime (price) {
    const f1 = price
      .mul(this.divisor)
      .div(this.USDWEI)
      .add(5);

    return new BigNumber(18432000)
      .div(f1)
      .sub(5760)
      .add(this.begin)
      .round()
      .toNumber();
  }

  isActive () {
    return this.now >= this.begin && this.now < this.end;
  }

  theDeal (value) {
    let accepted = new BigNumber(0);
    let refund = new BigNumber(0);

    const bonus = this.bonus(value);
    const price = this.price;

    if (!this.isActive()) {
      return {
        accepted,
        bonus,
        refund,
        price
      };
    }

    accepted = value.add(bonus);

    let tokens = accepted.div(price);

    if (tokens.gt(this.available)) {
      accepted = this.available.mul(price);
      if (value.gt(accepted)) {
        refund = value.sub(accepted);
      }
    }

    return {
      accepted,
      bonus,
      refund,
      price
    };
  }

  @computed
  get beginPrice () {
    return this.getPrice(this.begin);
  }

  @computed
  get endPrice () {
    return this.getPrice(this.end);
  }

  @computed
  get inBonus () {
    return this.now < this.begin + this.bonusDuration;
  }

  @computed
  get maxSpend () {
    return this.price.mul(this.available);
  }

  @computed
  get now () {
    if (!this.block || !this.block.timestamp) {
      return 0;
    }

    return this.block.timestamp;
  }

  async refresh () {
    const status = await backend.status();
    const { block, end } = status;

    status.timeLeft = Math.max(0, end - block.timestamp);
    this.update(status);
  }

  @action
  update (status) {
    const {
      available,
      begin,
      block,
      bonusDuration,
      bonusSize,
      buyinId,
      cap,
      connected,
      contractAddress,
      currentTime,
      divisor,
      end,
      price,
      statementHash,
      timeLeft,
      totalReceived
    } = status;

    this.available = new BigNumber(available);
    this.bonusSize = new BigNumber(bonusSize);
    this.cap = new BigNumber(cap);
    this.divisor = new BigNumber(divisor);
    this.price = new BigNumber('0x' + price.toString(16));
    this.totalReceived = new BigNumber(totalReceived);

    this.begin = begin;
    this.block = block;
    this.bonusDuration = bonusDuration;
    this.buyinId = buyinId;
    this.connected = connected;
    this.contractAddress = contractAddress;
    this.currentTime = currentTime;
    this.end = end;
    this.statementHash = statementHash;
    this.timeLeft = timeLeft;

    this.updateChartData();
  }

  @action
  updateChartData () {
    const { begin, beginPrice, divisor, end, endPrice } = this;

    // Only update the chart when the end time changes
    if (this.chart.end === end) {
      return;
    }

    const NUM_TICKS = 50;
    const data = [];

    const priceInteval = beginPrice.sub(endPrice).div(NUM_TICKS);

    for (let i = 0; i <= NUM_TICKS; i++) {
      const price = beginPrice.sub(priceInteval.mul(i));
      const date = this.getTime(price);

      data.push({ time: date * 1000, price: fromWei(price.mul(divisor)).toNumber() });
    }

    const realEnd = Math.round(Math.min(end, (new Date().getTime() / 1000) + 3600 * 24 * 7));
    const dateInterval = (realEnd - begin) / NUM_TICKS;

    for (let i = 0; i <= NUM_TICKS; i++) {
      const date = begin + dateInterval * i;
      const price = this.getPrice(date);

      data.push({ time: date * 1000, price: fromWei(price.mul(divisor)).toNumber() });
    }

    this.chart = {
      end: end,
      data: data
        .sort((ptA, ptB) => ptB.time - ptA.time)
        .filter((pt) => pt.time < realEnd * 1000)
    };
  }
}

export default new AuctionStore();
