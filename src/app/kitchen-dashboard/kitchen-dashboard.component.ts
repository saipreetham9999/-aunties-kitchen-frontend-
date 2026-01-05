import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, Order } from '../orders/order.service';

@Component({
  selector: 'app-kitchen-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kitchen-dashboard.component.html',
  styleUrls: ['./kitchen-dashboard.component.css']
})
export class KitchenDashboardComponent implements OnInit {
  orders: Order[] = [];
  orderStatuses: string[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;
  updatingStatus: { [orderId: string]: boolean } = {};

  constructor(private orderService: OrderService, private router: Router) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getKitchenOrders().subscribe({
      next: (data) => {
        this.orders = data; // The backend now sends only active kitchen orders
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError('Failed to load kitchen orders.');
        this.isLoading = false;
      }
    });
  }

  onUpdateStatus(order: Order, newStatus: string): void {
    if (!order.id || this.updatingStatus[order.id]) {
      return; // Prevent multiple clicks
    }
    this.updatingStatus[order.id] = true;

    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        order.status = updatedOrder.status;
        this.showFeedback(`Order #${order.id.substring(0, 8)} status updated to ${updatedOrder.status}.`);
        // Remove the order from the view if it's marked as completed or cancelled
        if (updatedOrder.status === 'COMPLETED' || updatedOrder.status === 'CANCELLED') {
          this.orders = this.orders.filter(o => o.id !== order.id);
        }
        this.updatingStatus[order.id] = false;
      },
      error: (err) => {
        this.handleError(`Failed to update order #${order.id.substring(0, 8)}.`);
        this.updatingStatus[order.id] = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  private showFeedback(message: string): void {
    this.feedbackMessage = message;
    setTimeout(() => this.feedbackMessage = null, 3000);
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = null, 5000);
  }
}
