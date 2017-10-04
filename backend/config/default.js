module.exports = {
  http: {
    hostname: '127.0.0.1',
    port: 4000
  },
  nodeWs: 'ws://127.0.0.1:8546/',
  certifierContract: '0x06C4AF12D9E3501C173b5D1B9dd9cF6DCC095b98',
  feeContract: '0xD5d12e7c067Aecb420C94b47d9CaA27912613378',
  saleContract: '0xeb3Bb13C2Dab2CaBbE2e74dFa252FC6a0cE89250',
  redis: {
    host: '127.0.0.1',
    port: 6379
  },
  onfido: {
    maxChecks: 3
  },
  // Gas Price of 2 Gwei
  gasPrice: '0x77359400'
};
