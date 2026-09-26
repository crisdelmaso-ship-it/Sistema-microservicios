import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, timeout } from 'rxjs';
import { ApiMessage } from './models';

const API = '/api/v1';

interface LoginRequest {
  user: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginResponse {
  jwt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly key = 'nova_jwt';

  login(
    request: LoginRequest
  ): Observable<ApiMessage<LoginResponse>> {

    return this.http
      .post<ApiMessage<LoginResponse>>(
        `${API}/auth/login`,
        request
      )
      .pipe(
        timeout(12000),

        tap(response => {
          const jwt = response.data?.jwt;

          if (jwt) {
            localStorage.setItem(this.key, jwt);
          }
        })
      );
  }

  register(
    request: RegisterRequest
  ): Observable<ApiMessage<unknown>> {

    return this.http
      .post<ApiMessage<unknown>>(
        `${API}/auth/register`,
        request
      )
      .pipe(
        timeout(12000)
      );
  }

  token(): string | null {
    return localStorage.getItem(this.key);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  isAdmin(): boolean {
    const token = this.token();

    if (!token) {
      return false;
    }

    try {
      const payload = token.split('.')[1];

      const normalized = payload
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const decoded = JSON.parse(
        atob(normalized)
      );

      return decoded?.role === 'ADMIN';

    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.key);
  }

  errorMessage(error: HttpErrorResponse): string {

    if (error.status === 0) {
      return 'No se pudo conectar con el gateway. Verifica que esté iniciado y que la dirección sea accesible desde este equipo.';
    }

    if (error.status === 502 || error.status === 504) {
      return (
        error.error?.message ||
        'El gateway no puede comunicarse con uno de los servicios.'
      );
    }

    return (
      error.error?.message ||
      error.error?.mensaje ||
      'No fue posible completar la operación.'
    );
  }
}
