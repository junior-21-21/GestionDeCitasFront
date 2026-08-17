import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { LoginComponent } from './login';
import { AuthService } from '../../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to dashboard after successful login', () => {
    authServiceSpy.login.and.returnValue(of({} as any));
    component.dto = { email: 'admin@test.com', password: 'Secret123' };

    component.login();

    expect(authServiceSpy.login).toHaveBeenCalledWith(component.dto);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should not call auth service when credentials are missing', () => {
    component.dto = { email: '', password: '' };

    component.login();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should handle failed login without navigating', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({
      error: { error: 'CREDENCIALES_INCORRECTAS', intentosRestantes: 4 }
    })));
    component.dto = { email: 'admin@test.com', password: 'bad-pass' };

    component.login();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
