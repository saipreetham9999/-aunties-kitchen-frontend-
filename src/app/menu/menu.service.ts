import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost:8080/api/menu';

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

  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  searchMenuItemByCode(code: string): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.apiUrl}/search?code=${code}`).pipe(catchError(this.handleError));
  }

  addMenuItem(item: Omit<MenuItem, 'id'>): Observable<MenuItem> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.post<MenuItem>(this.apiUrl, item, { headers }).pipe(catchError(this.handleError));
  }

  updateMenuItem(id: string, item: Partial<MenuItem>): Observable<MenuItem> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, item, { headers }).pipe(catchError(this.handleError));
  }

  deleteMenuItem(id: string): Observable<any> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.delete(`${this.apiUrl}/${id}`, { headers }).pipe(catchError(this.handleError));
  }
}
