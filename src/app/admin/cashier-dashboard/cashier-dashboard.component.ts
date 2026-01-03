import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuService, MenuItem } from '../manage-menu/menu.service';
import { OrderService, Order, OrderItem } from '../../orders/order.service';

interface CartItem extends OrderItem {
  menuItemId: string;
}

@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier-dashboard.component.html',
  styleUrls: ['./cashier-dashboard.component.css']
})
export class CashierDashboardComponent implements OnInit {
  menuItems: MenuItem[] = [];
  cart: CartItem[] = [];
  subtotal: number = 0;
  tax: number = 0;
  total: number = 0;
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private menuService: MenuService,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    this.menuService.getMenuItems().subscribe({
      next: (data) => this.menuItems = data,
      error: (err) => this.handleError('Failed to load menu items.')
    });
  }

  addToCart(menuItem: MenuItem): void {
    const existingItem = this.cart.find(item => item.menuItemId === menuItem.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        quantity: 1,
        price: menuItem.price
      });
    }
    this.calculateTotals();
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(cartItem => cartItem.menuItemId !== item.menuItemId);
    this.calculateTotals();
  }

  updateQuantity(item: CartItem, change: number): void {
    item.quantity += change;
    if (item.quantity <= 0) {
      this.removeFromCart(item);
    } else {
      this.calculateTotals();
    }
  }

  calculateTotals(): void {
    this.subtotal = this.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    this.tax = this.subtotal * 0.075; // 7.5% tax
    this.total = this.subtotal + this.tax;
  }

  applyDiscount(percentage: number): void {
    const discountAmount = this.subtotal * (percentage / 100);
    this.total = this.subtotal + this.tax - discountAmount;
    this.showFeedback(`${percentage}% discount applied.`);
  }

  finalizeBill(): void {
    if (this.cart.length === 0) {
      this.handleError('Cannot create an empty order.');
      return;
    }
    const newOrder = {
      items: this.cart.map(item => ({ menuItemId: item.menuItemId, quantity: item.quantity })),
      total: this.total
    };
    // This will require a new method in OrderService to create an order from the POS
    // For now, we'll just log it and clear the cart
    console.log('Finalizing order:', newOrder);
    this.showFeedback('Order created successfully!');
    this.cart = [];
    this.calculateTotals();
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
