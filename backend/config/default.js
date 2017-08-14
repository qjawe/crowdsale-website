module.exports = {
  http: {
    hostname: '127.0.0.1',
    port: 4000
  },
  nodeWs: 'ws://127.0.0.1:8546/',
  saleContract: '0xb1b2F7cCE9F50e3Dea180Ce776495Ab0AAFFaB01',
  onfido: {
    token: 'test_AQC7JrCe01PDsf6s8YGtg7aId5y2Mw0x'
  },
  redis: {
    host: '127.0.0.1',
    port: 6379
  },
  recaptcha: {
    secret: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
  },
  account: {
    filename: 'empty-phrase.json',
    password: ''
  },
  // Gas Price of 2GWei
  gasPrice: '0x77359400'
};
