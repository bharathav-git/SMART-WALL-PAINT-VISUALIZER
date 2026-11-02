import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should initialize with invalid empty form', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate email format and password length', () => {
    component.loginForm.patchValue({ email: 'not-an-email', password: '123' });
    expect(component.loginForm.valid).toBeFalse();
    expect(component.loginForm.get('email')?.errors?.['email']).toBeTrue();
    expect(component.loginForm.get('password')?.errors?.['minlength']).toBeDefined();

    component.loginForm.patchValue({ email: 'valid@example.com', password: 'password123' });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should fill demo user credentials when autofill button clicked', () => {
    component.fillDemoUser();
    expect(component.loginForm.get('email')?.value).toBe('demo@wallvisualizer.com');
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should fill admin user credentials when autofill button clicked', () => {
    component.fillAdminUser();
    expect(component.loginForm.get('email')?.value).toBe('admin@wallvisualizer.com');
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should display error message on failed login', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ error: { message: 'Invalid email or password' } }))
    );

    component.loginForm.patchValue({ email: 'wrong@example.com', password: 'password123' });
    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Invalid email or password');
  });
});
