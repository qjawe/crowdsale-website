
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

export function int2hex (int) {
  return `0x${int.toString(16)}`;
}

export function hex2buf (hex) {
  if (typeof hex !== 'string' || hex.substring(0, 2) !== '0x') {
    throw new Error('hex must be a `0x` prefixed string');
  }

  return Buffer.from(hex.substring(2), 'hex');
}
