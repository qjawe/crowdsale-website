import BigNumber from 'bignumber.js';
import { action, computed, observable } from 'mobx';

import backend from '../backend';
import { fromWei } from '../utils';

const REFRESH_DELAY = 2000;

class AuctionStore {
  @observable beginTime = new Date();
  @observable block = {};
  @observable BONUS_DURATION = new BigNumber(0);
  @observable BONUS_SIZE = new BigNumber(0);
  @observable chart = {};
  @observable connected = 'disconnected'
  @observable contractAddress = '0x';
  @observable currentPrice = new BigNumber(0);
  @observable DIVISOR = new BigNumber(1);
  @observable endTime = new Date();
  @observable STATEMENT_HASH = '0x';
  @observable tokensAvailable = new BigNumber(0);
  @observable tokenCap = new BigNumber(0);
  @observable totalAccounted = new BigNumber(0);
  @observable totalReceived = new BigNumber(0);

  USDWEI = new BigNumber(10).pow(18).div(200);

  constructor () {
    this.refresh();
  }

  bonus (value) {
    if (!this.isActive() || !this.inBonus) {
      return new BigNumber(0);
    }

    return value.mul(this.BONUS_SIZE).div(100);
  }

  getPrice (_time) {
    if (!this.isActive()) {
      return new BigNumber(0);
    }

    const time = new BigNumber(Math.round(_time.getTime() / 1000));
    const beginTime = new BigNumber(Math.round(this.beginTime.getTime() / 1000));
    const { DIVISOR, USDWEI } = this;

    return USDWEI
      .mul(new BigNumber(18432000).div(time.sub(beginTime).add(5760)).sub(5))
      .div(DIVISOR)
      .round();
  }

  getTime (price) {
    const beginTime = new BigNumber(Math.round(this.beginTime.getTime() / 1000));
    const { DIVISOR, USDWEI } = this;

    const f1 = price
      .mul(DIVISOR)
      .div(USDWEI)
      .add(5);

    const time = new BigNumber(18432000)
      .div(f1)
      .sub(5760)
      .add(beginTime)
      .round();

    return new Date(time.mul(1000).toNumber());
  }

  isActive () {
    return this.now >= this.beginTime && this.now < this.endTime;
  }

  theDeal (value) {
    let accepted = new BigNumber(0);
    let refund = new BigNumber(0);

    const bonus = this.bonus(value);
    const price = this.currentPrice;

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

    if (tokens.gt(this.tokensAvailable)) {
      accepted = this.tokensAvailable.mul(price);
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
    return this.getPrice(this.beginTime);
  }

  @computed
  get endPrice () {
    return this.getPrice(this.endTime);
  }

  @computed
  get inBonus () {
    const bonusEndTime = new Date(this.beginTime.getTime() + this.BONUS_DURATION * 1000);

    return this.now < bonusEndTime;
  }

  @computed
  get maxSpend () {
    return this.currentPrice.mul(this.tokensAvailable);
  }

  @computed
  get now () {
    if (!this.block || !this.block.timestamp) {
      return 0;
    }

    return new Date(this.block.timestamp);
  }

  async refresh () {
    try {
      const block = await backend.block();

      // Same block, no updates
      if (this.block.hash !== block.hash) {
        const status = await backend.status();

        this.update({ ...status, block });
      }
    } catch (error) {
      console.error(error);
    }

    setTimeout(() => {
      this.refresh();
    }, REFRESH_DELAY);
  }

  @action
  setChart (chart) {
    this.chart = chart;
  }

  @action
  update (status) {
    const {
      block,
      connected,
      contractAddress,

      BONUS_DURATION,
      BONUS_SIZE,
      DIVISOR,
      STATEMENT_HASH,

      beginTime,
      currentPrice,
      endTime,
      tokensAvailable,
      tokenCap,
      totalAccounted,
      totalReceived
    } = status;

    // Only update the chart when the price updates
    const nextTotalAccounted = new BigNumber(totalAccounted);
    const update = !nextTotalAccounted.eq(this.totalAccounted);

    this.beginTime = new Date(beginTime);
    this.BONUS_DURATION = new BigNumber(BONUS_DURATION);
    this.BONUS_SIZE = new BigNumber(BONUS_SIZE);
    this.currentPrice = new BigNumber(currentPrice);
    this.DIVISOR = new BigNumber(DIVISOR);
    this.endTime = new Date(endTime);
    this.tokensAvailable = new BigNumber(tokensAvailable);
    this.tokenCap = new BigNumber(tokenCap);
    this.totalAccounted = new BigNumber(totalAccounted);
    this.totalReceived = new BigNumber(totalReceived);

    this.block = block;
    this.connected = connected;
    this.contractAddress = contractAddress;
    this.STATEMENT_HASH = STATEMENT_HASH;

    if (update) {
      this.updateChartData();
    }
  }

  formatChartPrice (price) {
    if (price === undefined) {
      return undefined;
    }

    return this.formatPrice(price).toNumber();
  }

  formatPrice (price) {
    return fromWei(price.mul(this.DIVISOR));
  }

  formatChartData (data) {
    const { expectedTotalAccounted, price, time, totalAccounted } = data;

    return {
      expectedTotalAccounted: this.formatChartPrice(expectedTotalAccounted),
      totalAccounted: this.formatChartPrice(totalAccounted),
      price: this.formatChartPrice(price),
      time: time.getTime()
    };
  }

  async updateChartData () {
    const { beginTime, beginPrice, currentPrice, tokenCap, endTime, endPrice, now } = this;
    const totalAccountedRawData = await backend.chartData();

    const totalAccountedData = totalAccountedRawData
      .map((datum) => {
        const { time, totalAccounted } = datum;
        const value = new BigNumber(totalAccounted).div(tokenCap);

        return { value, time: new Date(time) };
      });

    const NUM_TICKS = 200;
    const data = [];

    const priceInteval = beginPrice.sub(endPrice).div(NUM_TICKS);

    for (let i = 0; i <= NUM_TICKS; i++) {
      // The price decreases with time
      const price = beginPrice.sub(priceInteval.mul(i));
      const time = this.getTime(price);

      data.push({ price, time });
    }

    const dateInterval = (endTime - beginTime) / NUM_TICKS;

    for (let i = 0; i <= NUM_TICKS; i++) {
      const time = new Date(beginTime.getTime() + dateInterval * i);
      const price = this.getPrice(time);

      data.push({ price, time });
    }

    const paddingTime = (endTime - beginTime) * 0.5;
    const lastTAD = totalAccountedData[totalAccountedData.length - 1];

    data.push({
      time: new Date(beginTime.getTime() - paddingTime),
      price: beginPrice,
      totalAccounted: new BigNumber(0)
    });

    data.push({
      time: new Date(endTime.getTime() + paddingTime),
      price: endPrice,
      expectedTotalAccounted: lastTAD.value
    });

    data.push({
      time: now,
      price: currentPrice,
      totalAccounted: lastTAD.value
    });

    data.forEach((datum) => {
      const { time } = datum;

      if (time >= now) {
        datum.expectedTotalAccounted = lastTAD.value;
        return;
      }

      if (time >= lastTAD.time && time < now) {
        datum.totalAccounted = lastTAD.value;
        return;
      }

      const index = totalAccountedData.findIndex((d) => d.time > time);

      if (index === 0) {
        datum.totalAccounted = new BigNumber(0);
        return;
      }

      if (index >= 1) {
        datum.totalAccounted = totalAccountedData[index - 1].value;
        return;
      }
    });

    this.setChart({
      data: data
        .sort((ptA, ptB) => ptB.time - ptA.time)
        .map((datum) => this.formatChartData(datum))
    });
  }
}

export default new AuctionStore();
