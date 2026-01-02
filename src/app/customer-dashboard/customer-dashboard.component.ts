import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { OrderService, Order, OrderItem } from '../orders/order.service'; // Import OrderService and interfaces

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {

  orders: Order[] = [];
  errorMessage: string | null = null;

  constructor(private orderService: OrderService) { } // Inject OrderService

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.orderService.getOrdersForCustomer().subscribe({
      next: (data: Order[]) => {
        this.orders = data;
        this.errorMessage = null; // Clear any previous errors
        console.log('Orders fetched successfully:', this.orders);
      },
      error: (err) => {
        console.error('Failed to fetch orders:', err);
        this.errorMessage = 'Failed to load orders. Please try again later.';
        // Optionally, you might want to redirect to login if it's an auth error
      }
    });
  }
}
