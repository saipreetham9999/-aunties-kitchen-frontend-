import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // Import tap for side effects

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private userKey = 'currentUser'; // Key for storing user data in localStorage

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    console.log('AuthService: Registering user. Sending data:', userData);
    return this.http.post(`${this.baseUrl}/register`, userData).pipe(
      tap(
        response => console.log('AuthService: Register successful. Response:', response),
        error => console.error('AuthService: Register failed. Error:', error)
      )
    );
  }

  login(credentials: any): Observable<any> {
    console.log('AuthService: Logging in user. Sending credentials:', credentials);
    return this.http.post(`${this.baseUrl}/login`, credentials).pipe(
      tap(
        (response: any) => {
          console.log('AuthService: Login successful. Response:', response);
          if (response && response.user) { // Assuming the backend returns a 'user' object
            this.saveUser(response.user);
          }
        },
        error => console.error('AuthService: Login failed. Error:', error)
      )
    );
  }

  verifyOtp(otpData: { email: string, otp: string }): Observable<any> {
    console.log('AuthService: Verifying OTP. Sending data:', otpData);
    return this.http.post(`${this.baseUrl}/verify-otp`, otpData).pipe(
      tap(
        response => console.log('AuthService: OTP verification successful. Response:', response),
        error => console.error('AuthService: OTP verification failed. Error:', error)
      )
    );
  }

  resendOtp(email: string): Observable<any> {
    console.log('AuthService: Resending OTP for email:', email);
    return this.http.post(`${this.baseUrl}/resend-otp`, { email }).pipe(
      tap(
        response => console.log('AuthService: Resend OTP successful. Response:', response),
        error => console.error('AuthService: Resend OTP failed. Error:', error)
      )
    );
  }

  // New methods for user management
  private saveUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): any | null {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  getUserRole(): string | null {
    const user = this.getUser();
    return user && user.role ? user.role : null;
  }

  logout(): void {
    localStorage.removeItem(this.userKey);
  }
}
