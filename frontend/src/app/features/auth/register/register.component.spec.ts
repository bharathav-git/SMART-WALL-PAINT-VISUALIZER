import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with invalid form', () => {
    expect(component).toBeTruthy();
    expect(component.registerForm.valid).toBeFalse();
  });

  it('should detect password and confirm password mismatch', () => {
    component.registerForm.patchValue({
      name: 'Artist Alice',
      email: 'alice@example.com',
      password: 'Password123',
      confirmPassword: 'MismatchPassword'
    });

    expect(component.registerForm.errors?.['passwordMismatch']).toBeTrue();
    expect(component.registerForm.valid).toBeFalse();
  });

  it('should be valid when passwords match and fields are valid', () => {
    component.registerForm.patchValue({
      name: 'Artist Alice',
      email: 'alice@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    });

    expect(component.registerForm.errors).toBeNull();
    expect(component.registerForm.valid).toBeTrue();
  });
});
