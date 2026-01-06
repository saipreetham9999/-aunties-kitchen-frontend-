import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'authToken';
  private roleKey = 'userRole';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (this.isBrowser && response && response.token) {
          const decodedToken = this.decodeToken(response.token);
          const role = decodedToken ? decodedToken.role : null;

          if (role) {
            this.saveAuthData(response.token, role);
            console.log(`AuthService: Login successful. Role "${role}" found in token and saved.`);
          } else {
            console.error('AuthService: Login successful, but no role claim found in JWT.');
            this.logout(); // Clear invalid auth state
          }
        } else if (this.isBrowser) {
          console.error('AuthService: Login failed. Server response did not include a token.');
        }
      })
    );
  }

  verifyOtp(otpData: { email: string, otp: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-otp`, otpData);
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/resend-otp`, { email });
  }

  private saveAuthData(token: string, role: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.roleKey, role);
    }
  }

  private decodeToken(token: string): any | null {
    if (!this.isBrowser) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      console.error('Error decoding JWT', e);
      return null;
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  getUserRole(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.roleKey);
    }
    return null;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.roleKey);
      console.log('AuthService: User logged out. Token and role removed.');
    }
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
