import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service'; // Import AuthService to get token

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
  total: number;
  items: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders'; // Adjust this to your actual backend orders API endpoint

  constructor(private http: HttpClient, private authService: AuthService) { }

  getOrdersForCustomer(): Observable<Order[]> {
    const user = this.authService.getUser();
    const token = user ? user.accessToken : null; // Assuming token is stored in user object

    if (!token) {
      // Handle case where no token is found (e.g., user not logged in)
      console.error('No authentication token found. User might not be logged in.');
      // You might want to throw an error or return an empty observable
      return new Observable<Order[]>(observer => {
        observer.error('Authentication required.');
        observer.complete();
      });
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Order[]>(`${this.apiUrl}/customer`, { headers });
  }
}
