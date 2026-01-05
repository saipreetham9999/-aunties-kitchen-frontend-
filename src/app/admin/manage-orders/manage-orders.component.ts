import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../orders/order.service';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule], // Removed unused RouterLink
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.css']
})
export class ManageOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private orderService: OrderService, private router: Router) { }

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load orders. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  viewUserOrders(userId: string | undefined): void {
    if (userId) {
      this.router.navigate(['/admin/orders/user', userId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}
