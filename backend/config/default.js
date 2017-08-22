module.exports = {
  http: {
    hostname: '127.0.0.1',
    port: 4000
  },
  nodeWs: 'ws://127.0.0.1:8546/',
  // saleContract: '0x778E173cA5822777Aa7c37c83ee598ef38D774A3',
  saleContract: '0x1812C24112a96487435cb77e8fab92E2eAb212ea',
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
