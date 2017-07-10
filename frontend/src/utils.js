
export async function get(url) {
  let response = await fetch('http://localhost:4000/');

  return response.json();
}

export function formatUnit (int, unit) {
  return `${int} ${unit}${int !== 1 ? 's' : ''}`;
}
