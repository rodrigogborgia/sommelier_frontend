// Usamos la variable pública para que esté disponible en el cliente
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function handleResponse(res) {
  if (!res.ok) {
    // Intenta parsear error JSON, si existe
    let details = "";
    try {
      const err = await res.json();
      details = ` | ${JSON.stringify(err)}`;
    } catch (_) {}
    throw new Error(`API error ${res.status}: ${res.statusText}${details}`);
  }
  // Si no hay body (204), devuelve null
  if (res.status === 204) return null;
  return res.json();
}

export async function apiGet(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    // En server components, Next.js hace fetch en el servidor por defecto.
    // Si necesitás cache control:
    // cache: 'no-store',
    ...options,
  });
  return handleResponse(res);
}

export async function apiPost(endpoint, body, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    ...options,
  });
  return handleResponse(res);
}

export async function apiPut(endpoint, body, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(body),
    ...options,
  });
  return handleResponse(res);
}

export async function apiDelete(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  return handleResponse(res);
}
