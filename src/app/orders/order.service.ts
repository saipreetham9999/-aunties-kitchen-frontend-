import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED'; // Adjusted to likely backend statuses
  total: number;
  items: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private createAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      // This case should ideally be handled by route guards
      // but as a safeguard, we can throw an error.
      throw new Error('No authentication token found!');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // For ROLE_CUSTOMER
  getOrdersForCustomer(): Observable<Order[]> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.get<Order[]>(`${this.apiUrl}/customer`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  // For ROLE_ADMIN
  getAllOrders(): Observable<Order[]> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.get<Order[]>(`${this.apiUrl}/admin/all`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  // For ROLE_KITCHEN
  getKitchenOrders(): Observable<Order[]> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.get<Order[]>(`${this.apiUrl}/kitchen`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  // For ROLE_KITCHEN to update status
  updateOrderStatus(orderId: string, status: string): Observable<any> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.put(`${this.apiUrl}/${orderId}/status`, { status }, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }
}
