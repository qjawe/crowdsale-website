import BigNumber from 'bignumber.js';
import Wallet from 'ethereumjs-wallet';
import { keccak_256 } from 'js-sha3'; // eslint-disable-line camelcase

const WEI = new BigNumber(10).pow(18);

export function createWallet (secret, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const wallet = Wallet.fromPrivateKey(Buffer.from(secret.slice(2), 'hex'));
        const v3Wallet = wallet.toV3(password, {
          c: 65536,
          kdf: 'pbkdf2'
        });

        return resolve(v3Wallet);
      } catch (error) {
        return reject(error);
      }
    }, 50);
  });
}

export function fromWei (value) {
  return new BigNumber(value).div(WEI);
}

export function toWei (value) {
  return new BigNumber(value).mul(WEI);
}

function checkStatus (response) {
  // To many Requests
  if (response.status === 429) {
    throw new Error('Too many requests have been sent from the same IP.');
  }
}

export async function get (url) {
  let response = await fetch(url);

  checkStatus(response);
  return response.json();
}

export function isValidAddress (value) {
  return value && value.length === 42 && /^0x[0-9a-g]{40}$/i.test(value);
}

export async function del (url, body) {
  let response = await fetch(url, {
    method: 'delete',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  checkStatus(response);

  if (!response.ok) {
    const text = await response.text();

    throw new Error(text);
  }

  return response.json();
}

export async function post (url, body) {
  let response = await fetch(url, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  checkStatus(response);

  if (!response.ok) {
    const text = await response.text();

    throw new Error(text);
  }

  return response.json();
}

function validateHex (hex) {
  if (typeof hex !== 'string' || hex.substring(0, 2) !== '0x') {
    throw new Error('hex must be a `0x` prefixed string');
  }
}

export function int2hex (int) {
  return `0x${int.toString(16)}`;
}

export function hex2buf (hex) {
  validateHex(hex);

  return Buffer.from(hex.substring(2), 'hex');
}

export function hex2int (hex) {
  validateHex(hex);

  return parseInt(hex.substring(2), 16);
}

export function toChecksumAddress (_address) {
  const address = (_address || '').toLowerCase();

  if (!isValidAddress(address)) {
    return '';
  }

  const hash = keccak_256(address.slice(-40));
  let result = '0x';

  for (let n = 0; n < 40; n++) {
    result = `${result}${parseInt(hash[n], 16) > 7 ? address[n + 2].toUpperCase() : address[n + 2]}`;
  }

  return result;
}

const PADDING = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Construct contract call ABI
 *
 * @param  {String}        fnId    `0x` prefixed first 4 bytes of the function signature hash
 * @param  {Number|Buffer} ...args arguments to pass into contract
 *
 * @return {String}                `0x` prefixed data field
 */
export function buildABIData (fnId, ...args) {
  let result = fnId;

  for (const arg of args) {
    let chunk;

    switch (typeof arg) {
      case 'number':
        chunk = arg.toString(16);
        break;
      default:
        chunk = arg.toString('hex');
    }

    if (chunk.length > 64) {
      throw new Error('ABI argument is too long!');
    }

    result += PADDING.substring(chunk.length) + chunk;
  }

  return result;
}
