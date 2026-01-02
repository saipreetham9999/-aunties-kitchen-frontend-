import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService, Order } from '../../orders/order.service';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.css']
})
export class ManageOrdersComponent implements OnInit {

  allOrders: Order[] = [];
  errorMessage: string | null = null;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.allOrders = data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load orders.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}
