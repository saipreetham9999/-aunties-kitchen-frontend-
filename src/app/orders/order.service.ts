import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName?: string;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
  total: number;
  items: OrderItem[];
}

export interface PlaceOrderPayload {
  items: { menuItemId: string; quantity: number; }[];
  total: number;
  customerId?: string; // For registered users
  guestName?: string;   // For guest users
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';

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

  // For CUSTOMER
  getOrdersForCustomer(): Observable<Order[]> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.get<Order[]>(`${this.apiUrl}/customer`, { headers }).pipe(catchError(this.handleError));
  }

  // For ADMIN
  getAllOrders(): Observable<Order[]> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.get<Order[]>(`${this.apiUrl}/admin/all`, { headers }).pipe(catchError(this.handleError));
  }

  // For ADMIN
  getOrdersByUserId(userId: string): Observable<Order[]> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.get<Order[]>(`${this.apiUrl}/admin/user/${userId}`, { headers }).pipe(catchError(this.handleError));
  }

  // For KITCHEN
  getKitchenOrders(): Observable<Order[]> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.get<Order[]>(`${this.apiUrl}/kitchen`, { headers }).pipe(catchError(this.handleError));
  }

  // For KITCHEN, ADMIN
  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, { status }, { headers }).pipe(catchError(this.handleError));
  }

  // For CUSTOMER, CASHIER
  placeOrder(payload: PlaceOrderPayload): Observable<Order> {
    const headers = this.createAuthHeaders();
    if (!headers) return throwError(() => new Error('No authentication token found.'));
    return this.http.post<Order>(this.apiUrl, payload, { headers }).pipe(catchError(this.handleError));
  }
}
