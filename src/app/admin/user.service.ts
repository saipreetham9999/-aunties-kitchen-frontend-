import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean; // Updated field name
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private adminApiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private createAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token found!');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUsers(): Observable<User[]> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.get<User[]>(`${this.adminApiUrl}/users`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  createUser(userData: any): Observable<User> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.post<User>(`${this.adminApiUrl}/users`, userData, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.put(`${this.adminApiUrl}/users/${userId}/role`, { role }, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  deleteUser(userId: string): Observable<any> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.delete(`${this.adminApiUrl}/users/${userId}`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  initiateAdminPromotion(userId: string): Observable<any> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.post(`${this.adminApiUrl}/promote/initiate`, { userId }, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  completeAdminPromotion(userId: string, otp: string): Observable<any> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.post(`${this.adminApiUrl}/promote/complete`, { userId, otp }, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  // New method for admin to verify a user's OTP
  verifyUserOtp(email: string, otp: string): Observable<any> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.post(`${this.adminApiUrl}/verify-otp`, { email, otp }, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }
}
