import { action, computed, observable } from 'mobx';

import backend from '../backend';

class AuctionStore {
  @observable available = 0;
  @observable begin = 0;
  @observable block = 0;
  @observable bonusDuration = 0;
  @observable bonusSize = 0;
  @observable buyinId = '0x';
  @observable cap = 0;
  @observable connected = 'disconnected'
  @observable contractAddress = '0x';
  @observable currentTime = 0;
  @observable end = 0;
  @observable price = 0;
  @observable statementHash = '0x';
  @observable timeLeft = 0;
  @observable totalReceived = 0;

  constructor () {
    this.refresh();

    setInterval(() => {
      this.refresh();
    }, 2500);
  }

  bonus (value) {
    if (!this.isActive() || !this.inBonus) {
      return 0;
    }

    return value * this.bonusSize / 100;
  }

  isActive () {
    return this.now >= this.begin && this.now < this.end;
  }

  theDeal (value) {
    let accepted = 0;
    let refund = 0;

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

    accepted = value + bonus;

    const available = this.tokensAvailable();
    let tokens = accepted / price;

    if (tokens > available) {
      accepted = available * price;
      if (value > accepted) {
        refund = value - accepted;
      }
    }

    return {
      accepted,
      bonus,
      refund,
      price
    };
  }

  tokensAvailable () {
    if (!this.isActive()) {
      return 0;
    }

    return this.cap - this.totalReceived / this.price;
  }

  @computed
  get inBonus () {
    return this.now < this.begin + this.bonusDuration;
  }

  @computed
  get maxSpend () {
    console.log({
      isActive: this.isActive(),
      cap: this.cap,
      totalReceived: this.totalReceived,
      price: this.price,
      tokensAvailable: this.tokensAvailable()
    });

    return this.price * this.tokensAvailable();
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

    this.available = available;
    this.begin = begin;
    this.block = block;
    this.bonusDuration = bonusDuration;
    this.bonusSize = bonusSize;
    this.buyinId = buyinId;
    this.cap = cap;
    this.connected = connected;
    this.contractAddress = contractAddress;
    this.currentTime = currentTime;
    this.end = end;
    this.price = price;
    this.statementHash = statementHash;
    this.timeLeft = timeLeft;
    this.totalReceived = totalReceived;
  }
}

export default new AuctionStore();
