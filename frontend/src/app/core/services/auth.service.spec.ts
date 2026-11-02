import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created and default to logged out', () => {
    expect(service).toBeTruthy();
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.isAdmin()).toBeFalse();
  });

  it('should store token and user session upon successful login', () => {
    const mockResponse = {
      success: true,
      data: {
        user: { _id: 'u1', name: 'Artisan', email: 'artisan@test.com', role: 'user' },
        token: 'test_token_xyz'
      }
    };

    service.login({ email: 'artisan@test.com', password: 'password123' }).subscribe((res) => {
      expect(res.data.token).toBe('test_token_xyz');
      expect(service.isLoggedIn()).toBeTrue();
      expect(service.currentUser()?.email).toBe('artisan@test.com');
      expect(service.isAdmin()).toBeFalse();
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should recognize admin role', () => {
    const mockResponse = {
      success: true,
      data: {
        user: { _id: 'u2', name: 'Administrator', email: 'admin@test.com', role: 'admin' },
        token: 'admin_token_abc'
      }
    };

    service.login({ email: 'admin@test.com', password: 'password123' }).subscribe(() => {
      expect(service.isAdmin()).toBeTrue();
    });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush(mockResponse);
  });

  it('should clear session upon logout', () => {
    localStorage.setItem('swpv_auth_token', 'token_123');
    service.logout();
    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('swpv_auth_token')).toBeNull();
  });
});
