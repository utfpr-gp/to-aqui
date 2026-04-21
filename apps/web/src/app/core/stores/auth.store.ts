import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // State
  private readonly _user = signal<UserProfile | null>(null);
  private readonly _accessToken = signal<string | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public selectors
  readonly user = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken());

  constructor() {
    this.loadFromStorage();
  }

  login(idToken: string): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.authService.loginWithGoogle(idToken).subscribe({
      next: (response) => {
        this._user.set(response.user);
        this._accessToken.set(response.accessToken);
        this._isLoading.set(false);
        this.saveToStorage(response.accessToken, response.user);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this._isLoading.set(false);
        const status = err.status;
        if (status === 403) {
          this._error.set(
            'E-mail não matriculado em nenhuma disciplina ativa',
          );
        } else if (status === 401) {
          this._error.set('Token de autenticação inválido');
        } else {
          this._error.set('Erro interno. Tente novamente.');
        }
      },
    });
  }

  logout(): void {
    this._user.set(null);
    this._accessToken.set(null);
    this._error.set(null);
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  private saveToStorage(token: string, user: UserProfile): void {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        this._accessToken.set(token);
        this._user.set(JSON.parse(userStr));
      } catch {
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
}
