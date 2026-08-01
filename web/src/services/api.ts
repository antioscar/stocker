// Helper de cliente HTTP con token JWT para el frontend
import { authService } from './auth';

const BASE_URL = '/api';

interface ApiError {
  error?: string;
  message?: string;
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Error en la solicitud';
    try {
      const data = (await response.json()) as ApiError;
      message = data.error || data.message || message;
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
