import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { OrderService, Order } from '../orders/order.service';

@Component({
  selector: 'app-kitchen-dashboard',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './kitchen-dashboard.component.html',
  styleUrls: ['./kitchen-dashboard.component.css']
})
export class KitchenDashboardComponent implements OnInit {

  activeOrders: Order[] = [];
  errorMessage: string | null = null;
  feedbackMessage: string | null = null;

  // Define the workflow statuses for the kitchen
  kitchenStatuses = ['NEW', 'IN_PROGRESS', 'READY'];

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadKitchenOrders();
  }

  loadKitchenOrders(): void {
    this.orderService.getKitchenOrders().subscribe({
      next: (data) => {
        // Sort orders to show NEW ones first
        this.activeOrders = data.sort((a, b) => {
          if (a.status === 'NEW' && b.status !== 'NEW') return -1;
          if (a.status !== 'NEW' && b.status === 'NEW') return 1;
          return 0; // Keep original order for others
        });
        console.log('Kitchen Dashboard: Active orders loaded.', this.activeOrders);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load active orders. Please ensure you are logged in as Kitchen staff.';
        console.error('Kitchen Dashboard: Error loading orders.', err);
      }
    });
  }

  onUpdateStatus(order: Order, newStatus: string): void {
    // Ensure the new status is a valid kitchen status
    if (!this.kitchenStatuses.includes(newStatus)) {
      this.errorMessage = `Invalid status update: ${newStatus}`;
      return;
    }

    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.showFeedback(`Order #${order.id} status updated to ${newStatus}.`);
        // Update the status locally for immediate UI feedback
        const updatedOrder = this.activeOrders.find(o => o.id === order.id);
        if (updatedOrder) {
          updatedOrder.status = newStatus as Order['status'];
        }
      },
      error: (err) => {
        this.errorMessage = `Failed to update status for order #${order.id}.`;
        console.error('Kitchen Dashboard: Error updating status.', err);
      }
    });
  }

  private showFeedback(message: string): void {
    this.feedbackMessage = message;
    setTimeout(() => this.feedbackMessage = null, 3000);
  }
}
