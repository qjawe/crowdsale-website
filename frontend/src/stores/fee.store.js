import BigNumber from 'bignumber.js';
import EthereumTx from 'ethereumjs-tx';

import backend from '../backend';
import appStore from './app.store';
import { isValidAddress } from '../utils';

// Gas Limit of 200k gas
const FEE_REGISTRAR_GAS_LIMIT = new BigNumber('0x30d40');
// Gas Price of 5Gwei
const FEE_REGISTRAR_GAS_PRICE = new BigNumber('0x12a05f200');
// Signature of `pay(address)`
const FEE_REGISTRAR_PAY_SIGNATURE = '0x0c11dedd';

class FeeStore {
  fee = null;
  feeRegistrar = null;
  totalFee = null;

  constructor () {
    this.load();
  }

  load = async () => {
    try {
      // Retrieve the fee
      const { fee, feeRegistrar } = await backend.fee();

      this.fee = fee;
      this.feeRegistrar = feeRegistrar;
      this.totalFee = fee.plus(FEE_REGISTRAR_GAS_PRICE.mul(FEE_REGISTRAR_GAS_LIMIT));
    } catch (error) {
      appStore.addError(error);
    }
  };

  async checkPayer () {
    try {
      // const { paid } = await backend.getAccountFeeInfo(payer);
    } catch (error) {
      appStore.addError(error);
    }
  }

  async sendPayment () {
    const { payer } = this;

    try {
      if (!isValidAddress(payer)) {
        throw new Error('invalid payer address: ' + payer);
      }

      this.goto('sending-payment');

      const { address, secret } = this.wallet;
      const privateKey = Buffer.from(secret.slice(2), 'hex');

      const nonce = await backend.nonce(address);
      const calldata = FEE_REGISTRAR_PAY_SIGNATURE + payer.slice(-40).padStart(64, 0);

      const tx = new EthereumTx({
        to: this.feeRegistrar,
        gasLimit: '0x' + FEE_REGISTRAR_GAS_LIMIT.toString(16),
        gasPrice: '0x' + FEE_REGISTRAR_GAS_PRICE.toString(16),
        data: calldata,
        value: '0x' + this.fee.toString(16),
        nonce
      });

      tx.sign(privateKey);

      const serializedTx = `0x${tx.serialize().toString('hex')}`;
      const { hash } = await backend.sendFeeTx(serializedTx);

      console.warn('sent FeeRegistrar tx', { transaction: hash, payer });
      this.setTransaction(hash);
    } catch (error) {
      appStore.addError(error);
    }
  }
}

export default new FeeStore();
