const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const TOKEN_KEY = "synapse_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    // fetch() throws a bare "Failed to fetch" for any network-level
    // failure — most commonly the API isn't reachable from this device
    // (e.g. VITE_API_URL still points at localhost while browsing from
    // a phone on the same network).
    throw new Error(
      `Nie udało się połączyć z serwerem (${API_URL}). Sprawdź, czy backend działa i czy VITE_API_URL wskazuje na właściwy adres.`,
    );
  }

  // 204 No Content has no body to parse.
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Wystąpił nieoczekiwany błąd.");
  }

  return data;
}
