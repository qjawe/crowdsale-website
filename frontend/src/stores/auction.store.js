import BigNumber from 'bignumber.js';
import { action, computed, observable } from 'mobx';

import backend from '../backend';
import blockStore from './block.store';

class AuctionStore {
  @observable beginTime = new Date();
  @observable block = {};
  @observable BONUS_DURATION = new BigNumber(0);
  @observable BONUS_SIZE = new BigNumber(0);
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
    this.init();
    blockStore.on('block', this.refresh, this);
  }

  async init () {
    const {
      BONUS_DURATION,
      BONUS_SIZE,
      DIVISOR,
      STATEMENT_HASH,
      beginTime,
      tokenCap
    } = await backend.sale();

    this.BONUS_DURATION = new BigNumber(BONUS_DURATION);
    this.BONUS_SIZE = new BigNumber(BONUS_SIZE);
    this.DIVISOR = new BigNumber(DIVISOR);
    this.STATEMENT_HASH = STATEMENT_HASH;

    this.beginTime = new Date(beginTime);
    this.tokenCap = new BigNumber(tokenCap);

    return this.refresh();
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

  getTarget (time) {
    const price = this.getPrice(time);

    return price.mul(this.DIVISOR).mul(this.tokenCap);
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

  getTimeFromTarget (target) {
    const price = target.div(this.DIVISOR).div(this.tokenCap);

    return this.getTime(price);
  }

  isActive () {
    return this.now >= this.beginTime && this.now < this.endTime;
  }

  weiToDot (weiValue) {
    const deal = this.theDeal(weiValue);

    if (deal.price.eq(0)) {
      return new BigNumber(0);
    }

    const dots = deal.accepted.div(deal.price).floor();

    return dots.div(this.DIVISOR);
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
      return new Date(0);
    }

    return new Date(this.block.timestamp);
  }

  async refresh () {
    try {
      const status = await backend.status();

      this.update(status);
    } catch (error) {
      console.error(error);
    }
  }

  @action
  update (status) {
    const {
      block,
      connected,
      contractAddress,

      currentPrice,
      endTime,
      tokensAvailable,
      totalAccounted,
      totalReceived
    } = status;

    if (block && block.number) {
      block.number = new BigNumber(block.number);
    }

    this.currentPrice = new BigNumber(currentPrice);
    this.endTime = new Date(endTime);
    this.tokensAvailable = new BigNumber(tokensAvailable);
    this.totalAccounted = new BigNumber(totalAccounted);
    this.totalReceived = new BigNumber(totalReceived);

    this.block = block;
    this.connected = connected;
    this.contractAddress = contractAddress;
  }
}

export default new AuctionStore();
