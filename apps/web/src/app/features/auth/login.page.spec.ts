import { TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(LoginPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the Google login button', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.btn-google') as HTMLButtonElement;

    expect(button).toBeTruthy();
    expect(button.textContent?.trim()).toContain('Entrar com Google');
    expect(button.disabled).toBe(false);
  });

  it('should show spinner and disable button when loading', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    const component = fixture.componentInstance;

    component.isLoading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('.spinner');
    const button = compiled.querySelector('.btn-google') as HTMLButtonElement;

    expect(spinner).toBeTruthy();
    expect(button.disabled).toBe(true);
    expect(button.textContent?.trim()).toContain('Entrando...');
  });

  it('should display error alert when errorMessage is set', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    const component = fixture.componentInstance;

    component.errorMessage.set('E-mail não matriculado em nenhuma disciplina ativa');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const alert = compiled.querySelector('.alert-error');

    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain('E-mail não matriculado');
  });

  it('should NOT display error alert when errorMessage is null', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const alert = compiled.querySelector('.alert-error');

    expect(alert).toBeFalsy();
  });

  it('should set loading to true and clear error on onGoogleLogin call', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    const component = fixture.componentInstance;

    component.errorMessage.set('Some old error');
    component.onGoogleLogin();

    expect(component.isLoading()).toBe(true);
    expect(component.errorMessage()).toBeNull();
  });

  it('should trigger onGoogleLogin on button click', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
    const component = fixture.componentInstance;

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.btn-google') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
  });
});
