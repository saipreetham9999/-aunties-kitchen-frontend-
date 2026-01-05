import { Injectable } from '@angular/core';
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

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          const decodedToken = this.decodeToken(response.token);
          const role = decodedToken ? decodedToken.role : null;

          if (role) {
            this.saveAuthData(response.token, role);
            console.log(`AuthService: Login successful. Role "${role}" found in token and saved.`);
          } else {
            console.error('AuthService: Login successful, but no role claim found in JWT.');
            this.logout(); // Clear invalid auth state
          }
        } else {
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
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
  }

  private decodeToken(token: string): any | null {
    try {
      // A JWT is composed of three parts: header, payload, signature, separated by dots.
      // The payload is the second part. It's a Base64-encoded JSON string.
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      console.error('Error decoding JWT', e);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    console.log('AuthService: User logged out. Token and role removed.');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
