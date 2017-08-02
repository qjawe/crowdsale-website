const config = require('config');
const fs = require('fs');
const path = require('path');
const { toBuffer, ecrecover, pubToAddress } = require('ethereumjs-util');
const EthereumTx = require('ethereumjs-tx');
const Wallet = require('ethereumjs-wallet');

const gasPrice = config.get('gasPrice');
const { filename, password } = config.get('account');
const keyFile = fs.readFileSync(path.resolve(__dirname, `../keys/${filename}`));
const keyObject = JSON.parse(keyFile.toString());

const wallet = Wallet.fromV3(keyObject, password);
const account = {
  address: '0x' + wallet.getAddress().toString('hex'),
  publicKey: wallet.getPublicKey(),
  privateKey: wallet.getPrivateKey()
};

class Certifier {
  constructor (sale) {
    this.sale = sale;
  }

  async certify (address) {
    const { connector } = this.sale;
    const data = this.sale.certifier.certify.getCallData(address);
    const options = {
      from: account.address,
      to: this.sale.certifier.address,
      value: '0x0',
      gasPrice,
      data
    };

    const gasLimit = await connector.estimateGas(options);
    const nonce = await connector.nextNonce(options.from);

    options.gasLimit = gasLimit;
    options.nonce = nonce;

    const tx = new EthereumTx(options);

    tx.sign(account.privateKey);

    const serializedTx = `0x${tx.serialize().toString('hex')}`;

    const txHash = await connector.sendTx(serializedTx);

    console.log('sent certify tx for', { address, txHash });

    return txHash;
  }

  async certifySignature (signature) {
    const { msgHash, v, r, s } = signature;

    const msgHashB = toBuffer(msgHash);
    const rB = toBuffer(r);
    const sB = toBuffer(s);

    const publicKey = ecrecover(msgHashB, v, rB, sB);
    const address = pubToAddress(publicKey);

    const txHash = await this.certifyAddress(address);

    return txHash;
  }
}

module.exports = Certifier;
