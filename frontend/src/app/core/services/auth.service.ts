import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User, AuthResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'swpv_auth_token';
  private readonly USER_KEY = 'swpv_auth_user';

  // Angular signals for modern reactive state
  private currentUserSignal = signal<User | null>(this.getStoredUser());
  private tokenSignal = signal<string | null>(this.getStoredToken());

  currentUser = this.currentUserSignal.asReadonly();
  token = this.tokenSignal.asReadonly();
  isLoggedIn = computed(() => !!this.tokenSignal());
  isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {}

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const data = localStorage.getItem(this.USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  register(payload: { name: string; email: string; password: string; confirmPassword: string }): Observable<any> {
    return this.http.post<any>('/api/auth/register', payload).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post<any>('/api/auth/login', payload).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  getMe(): Observable<any> {
    return this.http.get<any>('/api/auth/me').pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.currentUserSignal.set(res.data);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
        }
      }),
      catchError((err) => {
        if (err.status === 401) {
          this.logout();
        }
        return throwError(() => err);
      })
    );
  }

  toggleFavoriteColor(hex: string): Observable<any> {
    return this.http.post<any>('/api/auth/favorite-color', { hex }).pipe(
      tap((res) => {
        if (res.success && res.data?.favoriteColors) {
          const user = this.currentUserSignal();
          if (user) {
            const updated = { ...user, favoriteColors: res.data.favoriteColors };
            this.currentUserSignal.set(updated);
            localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(authData: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authData.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
    this.tokenSignal.set(authData.token);
    this.currentUserSignal.set(authData.user);
  }
}
