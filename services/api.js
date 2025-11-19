const API_BASE_URL = process.env.API_BASE_URL;

// Normaliza la URL para que siempre quede con una sola barra
function buildUrl(endpoint) {
  // elimina barra final en API_BASE_URL si la hubiera
  const base = API_BASE_URL.replace(/\/$/, "");
  // elimina barra inicial en endpoint si la hubiera
  const path = endpoint.replace(/^\//, "");
  return `${base}/${path}`;
}

export async function apiGet(endpoint) {
  const res = await fetch(buildUrl(endpoint), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function apiPost(endpoint, body) {
  const res = await fetch(buildUrl(endpoint), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}
