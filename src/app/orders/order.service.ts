import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName?: string; // Optional customer name
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
  total: number;
  items: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';
  private adminApiUrl = 'http://localhost:8080/api/admin/orders';

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

  // For ROLE_CUSTOMER
  getOrdersForCustomer(): Observable<Order[]> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.get<Order[]>(`${this.apiUrl}/customer`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  // For ROLE_ADMIN to get all orders
  getAllOrders(): Observable<Order[]> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.get<Order[]>(this.adminApiUrl, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  // For ROLE_ADMIN to get orders for a specific user
  getOrdersByUserId(userId: string): Observable<Order[]> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.get<Order[]>(`${this.adminApiUrl}/user/${userId}`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  // For ROLE_KITCHEN/ADMIN to update status
  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.put<Order>(`${this.adminApiUrl}/${orderId}/status`, { status }, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  // For ROLE_CASHIER to create a new order
  createOrder(orderData: { items: { menuItemId: string, quantity: number }[], total: number }): Observable<Order> {
    try {
      const headers = this.createAuthHeaders();
      return this.http.post<Order>(this.apiUrl, orderData, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }
}
