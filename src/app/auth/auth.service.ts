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
        if (response && response.token && response.role) {
          this.saveAuthData(response.token, response.role);
          console.log('AuthService: Login successful. Token and role saved.');
        } else {
          console.error('AuthService: Login failed. Invalid response from server.');
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
