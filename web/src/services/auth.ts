// Servicio de autenticación para el frontend
import { LoginRequest, LoginResponse, AuthMeResponse } from '../types/api';

class AuthService {
  private baseURL = '/api';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en el login');
    }

    return response.json();
  }

  async getCurrentUser(token: string): Promise<AuthMeResponse> {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token inválido');
      }
      throw new Error('Error al obtener usuario');
    }

    return response.json();
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.removeToken();
  }
}

export const authService = new AuthService();
