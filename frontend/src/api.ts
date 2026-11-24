const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (!configuredApiBaseUrl && !import.meta.env.DEV) {
  throw new Error(
    'La variable VITE_API_BASE_URL doit être définie pour la production.',
  )
}

const API_BASE_URL = (
  configuredApiBaseUrl || '/api'
).replace(/\/+$/, '')

export const NETWORK_ERROR_MESSAGE =
  'Connexion au serveur impossible. Vérifiez que le backend est démarré et réessayez.'

// Erreur spécifique levée lorsque le serveur backend est inaccessible (US14).
export class NetworkError extends Error {
  constructor(message = NETWORK_ERROR_MESSAGE) {
    super(message)
    this.name = 'NetworkError'
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof NetworkError || error instanceof TypeError
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  let response: Response

  try {
    response = await fetch(apiUrl(path), init)
  } catch {
    throw new NetworkError()
  }

  // En développement, le proxy Vite retourne 502/503/504 si le backend est arrêté.
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    throw new NetworkError()
  }

  return response
}