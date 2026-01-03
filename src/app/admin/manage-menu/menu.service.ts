import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost:8080/api/menu';

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

  getMenuItems(): Observable<MenuItem[]> {
    try {
      // No auth headers needed for menu items, as they are public
      return this.http.get<MenuItem[]>(this.apiUrl);
    } catch (error) {
      return throwError(() => error);
    }
  }

  createMenuItem(menuItemData: FormData): Observable<MenuItem> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.post<MenuItem>(this.apiUrl, menuItemData, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  updateMenuItem(id: string, menuItemData: FormData): Observable<MenuItem> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.put<MenuItem>(`${this.apiUrl}/${id}`, menuItemData, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  deleteMenuItem(id: string): Observable<any> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.delete(`${this.apiUrl}/${id}`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }
}
