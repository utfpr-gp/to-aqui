import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LoginPage } from './login.page';
import { AuthStore } from '../../core/stores/auth.store';

describe('LoginPage', () => {
  const mockIsLoading = signal(false);
  const mockError = signal<string | null>(null);
  const mockLogin = vi.fn();

  const mockAuthStore = {
    isLoading: mockIsLoading.asReadonly(),
    error: mockError.asReadonly(),
    login: mockLogin,
    user: signal(null).asReadonly(),
    accessToken: signal(null).asReadonly(),
    isAuthenticated: signal(false).asReadonly(),
    logout: vi.fn(),
  };

  beforeEach(async () => {
    mockIsLoading.set(false);
    mockError.set(null);
    mockLogin.mockClear();

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [{ provide: AuthStore, useValue: mockAuthStore }],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(LoginPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the Google login button enabled by default', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.btn-google') as HTMLButtonElement;

    expect(button).toBeTruthy();
    expect(button.textContent?.trim()).toContain('Entrar com Google');
    expect(button.disabled).toBe(false);
  });

  it('should show spinner and disable button when store is loading', async () => {
    const fixture = TestBed.createComponent(LoginPage);

    mockIsLoading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('.spinner');
    const button = compiled.querySelector('.btn-google') as HTMLButtonElement;

    expect(spinner).toBeTruthy();
    expect(button.disabled).toBe(true);
    expect(button.textContent?.trim()).toContain('Entrando...');
  });

  it('should display error alert when store has an error', async () => {
    const fixture = TestBed.createComponent(LoginPage);

    mockError.set('E-mail não matriculado em nenhuma disciplina ativa');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const alert = compiled.querySelector('.alert-error');

    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain('E-mail não matriculado');
  });

  it('should NOT display error alert when no error', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const alert = compiled.querySelector('.alert-error');

    expect(alert).toBeFalsy();
  });

  it('should call authStore.login on button click', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.btn-google') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(mockLogin).toHaveBeenCalled();
  });
});
