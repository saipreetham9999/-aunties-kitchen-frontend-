import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order } from '../../orders/order.service';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.css']
})
export class UserOrdersComponent implements OnInit {

  orders: Order[] = [];
  userId: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId');
    if (this.userId) {
      this.loadOrdersForUser(this.userId);
    } else {
      this.errorMessage = 'No User ID provided. Cannot fetch orders.';
    }
  }

  loadOrdersForUser(userId: string): void {
    this.orderService.getOrdersByUserId(userId).subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        this.errorMessage = `Failed to load orders for user ${userId}. You may not have the required permissions.`;
        console.error(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}
