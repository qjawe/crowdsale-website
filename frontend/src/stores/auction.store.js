import BigNumber from 'bignumber.js';
import { action, computed, observable } from 'mobx';

import backend from '../backend';

const REFRESH_DELAY = 2000;

class AuctionStore {
  @observable available = new BigNumber(0);
  @observable begin = 0;
  @observable block = 0;
  @observable bonusDuration = 0;
  @observable bonusSize = new BigNumber(0);
  @observable buyinId = '0x';
  @observable cap = new BigNumber(0);
  @observable connected = 'disconnected'
  @observable contractAddress = '0x';
  @observable currentTime = 0;
  @observable end = 0;
  @observable price = new BigNumber(0);
  @observable statementHash = '0x';
  @observable timeLeft = 0;
  @observable totalReceived = new BigNumber(0);

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
      end,
      price,
      statementHash,
      timeLeft,
      totalReceived
    } = status;

    this.available = new BigNumber(available);
    this.bonusSize = new BigNumber(bonusSize);
    this.cap = new BigNumber(cap);
    this.price = new BigNumber(price);
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
  }
}

export default new AuctionStore();
