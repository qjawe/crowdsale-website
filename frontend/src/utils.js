
export async function get(url) {
  let response = await fetch('http://localhost:4000/');

  return response.json();
}
