import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthStore } from './auth.store';
import { environment } from '../../../environments/environment';

describe('AuthStore', () => {
  let store: AuthStore;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', component: {} as any },
          { path: '', component: {} as any },
        ]),
      ],
    });

    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should start with null user and not authenticated', () => {
    expect(store.user()).toBeNull();
    expect(store.accessToken()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('login', () => {
    it('should set user and token on successful login and navigate to /', () => {
      store.login('google-id-token');

      expect(store.isLoading()).toBe(true);

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/google`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ idToken: 'google-id-token' });

      req.flush({
        accessToken: 'jwt-abc-123',
        user: {
          id: 'user-1',
          email: 'aluno@utfpr.edu.br',
          name: 'Test Student',
          role: 'STUDENT',
        },
      });

      expect(store.isLoading()).toBe(false);
      expect(store.isAuthenticated()).toBe(true);
      expect(store.user()?.email).toBe('aluno@utfpr.edu.br');
      expect(store.accessToken()).toBe('jwt-abc-123');
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(localStorage.getItem('accessToken')).toBe('jwt-abc-123');
    });

    it('should set 403 error for non-enrolled email', () => {
      store.login('valid-but-not-enrolled');

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/google`);
      req.flush(
        { message: 'E-mail não matriculado em nenhuma disciplina ativa' },
        { status: 403, statusText: 'Forbidden' },
      );

      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBe(
        'E-mail não matriculado em nenhuma disciplina ativa',
      );
      expect(store.isAuthenticated()).toBe(false);
    });

    it('should set 401 error for invalid token', () => {
      store.login('bad-token');

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/google`);
      req.flush(
        { message: 'Token de autenticação inválido' },
        { status: 401, statusText: 'Unauthorized' },
      );

      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBe('Token de autenticação inválido');
    });

    it('should set generic error for 5xx', () => {
      store.login('token');

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/google`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBe('Erro interno. Tente novamente.');
    });
  });

  describe('logout', () => {
    it('should clear state and localStorage, and navigate to /login', () => {
      // Simulate logged-in state
      localStorage.setItem('accessToken', 'old-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'a@b.c', name: 'X', role: 'STUDENT' }));

      store.logout();

      expect(store.user()).toBeNull();
      expect(store.accessToken()).toBeNull();
      expect(store.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('persistence', () => {
    it('should load user and token from localStorage on init', () => {
      const user = { id: 'u1', email: 'a@b.c', name: 'Test', role: 'STUDENT' };
      localStorage.setItem('accessToken', 'persisted-token');
      localStorage.setItem('user', JSON.stringify(user));

      // Reset and recreate to force constructor to re-run with seeded storage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthStore,
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
        ],
      });

      const freshStore = TestBed.inject(AuthStore);
      expect(freshStore.accessToken()).toBe('persisted-token');
      expect(freshStore.user()?.email).toBe('a@b.c');
      expect(freshStore.isAuthenticated()).toBe(true);
    });
  });
});
