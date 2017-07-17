
export async function get(url) {
  let response = await fetch(url);

  return response.json();
}

export async function post(url, body) {
  let response = await fetch(url, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  });

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
        chunk = arg.toString('hex')
    }

    if (chunk.length > 64) {
      throw new Error('ABI argument is too long!');
    }

    result += PADDING.substring(chunk.length) + chunk;
  }

  return result;
}
