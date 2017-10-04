import BigNumber from 'bignumber.js';
import EthereumTx from 'ethereumjs-tx';

import backend from '../backend';
import config from './config.store';
import appStore from './app.store';
import { isValidAddress } from '../utils';

// Gas Limit of 200k gas
const FEE_REGISTRAR_GAS_LIMIT = new BigNumber('0x30d40');
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
      this.totalFee = fee.plus(config.get('gasPrice').mul(FEE_REGISTRAR_GAS_LIMIT));
    } catch (error) {
      appStore.addError(error);
    }
  };

  async sendPayment (who, privateKey) {
    try {
      if (!isValidAddress(who)) {
        throw new Error('invalid payer address: ' + who);
      }

      const privateKeyBuf = Buffer.from(privateKey.slice(2), 'hex');

      const nonce = await backend.nonce(who);
      const calldata = FEE_REGISTRAR_PAY_SIGNATURE + who.slice(-40).padStart(64, 0);

      const tx = new EthereumTx({
        to: this.feeRegistrar,
        gasLimit: '0x' + FEE_REGISTRAR_GAS_LIMIT.toString(16),
        gasPrice: '0x' + config.get('gasPrice').toString(16),
        data: calldata,
        value: '0x' + this.fee.toString(16),
        nonce
      });

      tx.sign(privateKeyBuf);

      const serializedTx = `0x${tx.serialize().toString('hex')}`;
      const { hash } = await backend.sendFeeTx(serializedTx);

      console.warn('sent FeeRegistrar tx', { transaction: hash, who });
    } catch (error) {
      appStore.addError(error);
    }
  }
}

export default new FeeStore();
