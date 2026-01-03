import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../orders/order.service';

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

  constructor(private orderService: OrderService, private router: Router) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        // Filter out completed or cancelled orders for a cleaner view
        this.orders = data.filter(order => order.status !== 'COMPLETED' && order.status !== 'CANCELLED');
      },
      error: (err) => this.handleError('Failed to load orders.')
    });
  }

  onUpdateStatus(order: Order, newStatus: string): void {
    if (!order.id) {
      this.handleError('Order ID is missing.');
      return;
    }
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        order.status = updatedOrder.status;
        this.showFeedback(`Order #${order.id} status updated to ${updatedOrder.status}.`);
        // Optionally, remove the order from the list if it's completed or cancelled
        if (updatedOrder.status === 'COMPLETED' || updatedOrder.status === 'CANCELLED') {
          this.orders = this.orders.filter(o => o.id !== order.id);
        }
      },
      error: (err) => this.handleError(`Failed to update order #${order.id}.`)
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
