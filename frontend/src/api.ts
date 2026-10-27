const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (!configuredApiBaseUrl && !import.meta.env.DEV) {
  throw new Error(
    'La variable VITE_API_BASE_URL doit être définie pour la production.',
  )
}

const API_BASE_URL = (
  configuredApiBaseUrl || '/api'
).replace(/\/+$/, '')

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

export function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(apiUrl(path), init)
}
