import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

// This type represents the data coming from the backend, which includes the 'ROLE_' prefix.
export type PrefixedRole = 'ROLE_CUSTOMER' | 'ROLE_KITCHEN' | 'ROLE_CASHIER' | 'ROLE_ADMIN';

// This type represents the clean role names used for updates or display.
export type CleanRole = 'CUSTOMER' | 'KITCHEN' | 'CASHIER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: PrefixedRole; // The role from the backend will have the prefix.
  emailVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private adminApiUrl = 'http://localhost:8080/api/admin';
  private authApiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private createAuthHeaders(): HttpHeaders | null {
    const token = this.authService.getToken();
    if (!token) return null;
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    const message = error.error?.message || error.message || 'An unknown error occurred.';
    return throwError(() => new Error(message));
  }

  getUsers(): Observable<User[]> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.get<User[]>(`${this.adminApiUrl}/users`, { headers }).pipe(catchError(this.handleError));
  }

  searchUsers(query: string): Observable<User[]> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.get<User[]>(`${this.adminApiUrl}/users/search?q=${query}`, { headers }).pipe(catchError(this.handleError));
  }

  createUser(userData: any): Observable<User> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.post<User>(`${this.adminApiUrl}/users`, userData, { headers }).pipe(catchError(this.handleError));
  }

  // The backend expects the clean role name for updates.
  updateUserRole(userId: string, role: CleanRole): Observable<any> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.put(`${this.adminApiUrl}/users/${userId}/role`, { role }, { headers }).pipe(catchError(this.handleError));
  }

  deleteUser(userId: string): Observable<any> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.delete(`${this.adminApiUrl}/users/${userId}`, { headers }).pipe(catchError(this.handleError));
  }

  initiateAdminPromotion(userId: string): Observable<any> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.post(`${this.adminApiUrl}/users/${userId}/promote/initiate`, {}, { headers }).pipe(catchError(this.handleError));
  }

  completeAdminPromotion(userId: string, otp: string): Observable<any> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.post(`${this.adminApiUrl}/users/${userId}/promote/confirm`, { otp }, { headers }).pipe(catchError(this.handleError));
  }

  verifyUserOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.authApiUrl}/verify-otp`, { email, otp }).pipe(catchError(this.handleError));
  }
}
