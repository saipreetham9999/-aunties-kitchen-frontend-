import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface MenuItem {
  id?: string;
  name: string;
  price: number;
  category: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuApiUrl = 'http://localhost:8080/api/menu';

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

  // GET: Fetch all menu items (Public)
  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.menuApiUrl);
  }

  // POST: Add a new item to the menu (Admin)
  addMenuItem(item: MenuItem): Observable<MenuItem> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.post<MenuItem>(this.menuApiUrl, item, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  // PUT: Update an existing menu item (Admin)
  updateMenuItem(item: MenuItem): Observable<MenuItem> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.put<MenuItem>(`${this.menuApiUrl}/${item.id}`, item, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  // DELETE: Remove an item from the menu (Admin)
  deleteMenuItem(menuItemId: string): Observable<any> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.delete(`${this.menuApiUrl}/${menuItemId}`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }
}
