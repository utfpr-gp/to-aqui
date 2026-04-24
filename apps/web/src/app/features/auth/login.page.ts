import { Component, computed, inject } from '@angular/core';
import { AuthStore } from '../../core/stores/auth.store';

declare const google: any;

@Component({
  selector: 'app-login-page',
  standalone: true,
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Tô Aqui!</h1>
          <p>Faça login com sua conta Google para registrar presença</p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-error" role="alert">
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <div class="login-actions">
          @if (isLoading()) {
            <div class="spinner" role="status" aria-label="Carregando">
              <div class="spinner-circle"></div>
            </div>
          }

          <button
            class="btn-google"
            [disabled]="isLoading()"
            (click)="onGoogleLogin()"
          >
            @if (isLoading()) {
              Entrando...
            } @else {
              Entrar com Google
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      max-width: 400px;
      width: 100%;
      text-align: center;
    }

    .login-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 0.5rem 0;
    }

    .login-header p {
      color: #666;
      font-size: 0.95rem;
      margin: 0 0 1.5rem 0;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .alert-error {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .spinner {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .spinner-circle {
      width: 32px;
      height: 32px;
      border: 3px solid #e5e7eb;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .btn-google {
      width: 100%;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: white;
      background: #4285f4;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s, opacity 0.2s;
    }

    .btn-google:hover:not(:disabled) {
      background: #3367d6;
    }

    .btn-google:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  `]
})
export class LoginPage {
  private readonly authStore = inject(AuthStore);

  readonly isLoading = this.authStore.isLoading;
  readonly errorMessage = this.authStore.error;

  onGoogleLogin(): void {
    // TODO: Replace with real Google Sign-In flow
    // For now, this is a placeholder that will be wired to Google Identity Services
    this.authStore.login('placeholder-id-token');
  }
}

