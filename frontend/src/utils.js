
export async function get(url) {
  let response = await fetch(url);

  return response.json();
}

export function int2hex (int) {
  return `0x${int.toString(16)}`;
}
