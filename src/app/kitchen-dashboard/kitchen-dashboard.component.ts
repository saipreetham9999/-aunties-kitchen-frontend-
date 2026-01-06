import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, Order } from '../orders/order.service';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-kitchen-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kitchen-dashboard.component.html',
  styleUrls: ['./kitchen-dashboard.component.css']
})
export class KitchenDashboardComponent implements OnInit, OnDestroy {

  // Columns for the Kanban board
  pendingOrders: Order[] = [];
  confirmedOrders: Order[] = [];
  preparingOrders: Order[] = [];
  readyForPickupOrders: Order[] = [];

  orderStatuses: string[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];

  private pollingSubscription?: Subscription;
  public knownOrderIds = new Set<string>(); // Changed to public
  private notificationSound = new Audio('assets/notification.mp3');

  isLoading = true;
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;
  updatingStatus: { [orderId: string]: boolean } = {};

  constructor(private orderService: OrderService, private router: Router) { }

  ngOnInit(): void {
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  startPolling(): void {
    this.pollingSubscription = timer(0, 20000) // Poll every 20 seconds
      .pipe(switchMap(() => this.orderService.getKitchenOrders()))
      .subscribe({
        next: (data) => {
          this.processOrders(data);
          this.isLoading = false;
        },
        error: (err) => {
          this.handleError('Failed to auto-refresh kitchen orders.');
          this.isLoading = false;
        }
      });
  }

  stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
  }

  processOrders(orders: Order[]): void {
    // Reset columns
    this.pendingOrders = [];
    this.confirmedOrders = [];
    this.preparingOrders = [];
    this.readyForPickupOrders = [];

    let newOrderFound = false;
    orders.forEach(order => {
      // Check for new orders to play notification sound
      if (!this.knownOrderIds.has(order.id)) {
        newOrderFound = true;
        this.knownOrderIds.add(order.id);
      }

      // Assign order to the correct column
      switch (order.status) {
        case 'PENDING':
          this.pendingOrders.push(order);
          break;
        case 'CONFIRMED':
          this.confirmedOrders.push(order);
          break;
        case 'PREPARING':
          this.preparingOrders.push(order);
          break;
        case 'READY_FOR_PICKUP':
          this.readyForPickupOrders.push(order);
          break;
      }
    });

    if (newOrderFound && !this.isLoading) {
      this.playNotificationSound();
    }
  }

  onUpdateStatus(order: Order, newStatus: string): void {
    if (!order.id || this.updatingStatus[order.id]) return;

    this.updatingStatus[order.id] = true;

    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        this.showFeedback(`Order #${order.id.substring(0, 8)} updated to ${updatedOrder.status}.`);
        // Manually move the order in the UI for an instant update
        this.moveOrderToNewColumn(order, updatedOrder.status as any);
        this.updatingStatus[order.id] = false;
      },
      error: (err) => {
        this.handleError(`Failed to update order #${order.id.substring(0, 8)}.`);
        this.updatingStatus[order.id] = false;
      }
    });
  }

  moveOrderToNewColumn(order: Order, newStatus: Order['status']): void {
    // Remove from all columns first
    this.pendingOrders = this.pendingOrders.filter(o => o.id !== order.id);
    this.confirmedOrders = this.confirmedOrders.filter(o => o.id !== order.id);
    this.preparingOrders = this.preparingOrders.filter(o => o.id !== order.id);
    this.readyForPickupOrders = this.readyForPickupOrders.filter(o => o.id !== order.id);

    order.status = newStatus;

    // Add to the new column if it's still an active kitchen status
    switch (newStatus) {
      case 'PENDING': this.pendingOrders.push(order); break;
      case 'CONFIRMED': this.confirmedOrders.push(order); break;
      case 'PREPARING': this.preparingOrders.push(order); break;
      case 'READY_FOR_PICKUP': this.readyForPickupOrders.push(order); break;
    }
  }

  playNotificationSound(): void {
    this.notificationSound.play().catch(err => console.error("Could not play notification sound:", err));
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
