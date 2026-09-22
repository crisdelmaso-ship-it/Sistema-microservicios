import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiMessage } from './models';

const API = 'http://localhost:3000/api/v1';
interface LoginResponse { jwt: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly key = 'nova_jwt';
  login(request: { user: string; password: string }): Observable<ApiMessage<LoginResponse>> { return this.http.post<ApiMessage<LoginResponse>>(`${API}/auth/login`, request).pipe(tap(response => { if (response.data?.jwt) sessionStorage.setItem(this.key, response.data.jwt); })); }
  register(request: { username: string; email: string; password: string }): Observable<ApiMessage<unknown>> { return this.http.post<ApiMessage<unknown>>(`${API}/auth/register`, request); }
  token(): string | null { return sessionStorage.getItem(this.key); }
  isAuthenticated(): boolean { return !!this.token(); }
  logout(): void { sessionStorage.removeItem(this.key); }
  errorMessage(error: HttpErrorResponse): string { return error.error?.message || error.error?.mensaje || 'No fue posible completar la operación.'; }
}