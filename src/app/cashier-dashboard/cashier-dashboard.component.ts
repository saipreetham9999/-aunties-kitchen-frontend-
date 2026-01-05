import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';

import { MenuService, MenuItem } from '../menu/menu.service';
import { CartService } from '../orders/cart.service';
import { OrderService, PlaceOrderPayload } from '../orders/order.service';
import { UserService, User } from '../admin/user.service';

@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier-dashboard.component.html',
  styleUrls: ['./cashier-dashboard.component.css']
})
export class CashierDashboardComponent implements OnInit, OnDestroy {
  // UI State
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;
  isLoadingMenu = false;
  isPlacingOrder = false;
  isSearching = false;

  // Data
  menuItems: MenuItem[] = [];
  cartItems: any[] = [];
  foundUsers: User[] = [];

  // Customer State
  selectedCustomer: User | null = null;
  guestName = '';

  // RxJS Subjects and Subscriptions
  private customerSearchTerm = new Subject<string>();
  private subscriptions = new Subscription();

  constructor(
    private menuService: MenuService,
    private cartService: CartService,
    private orderService: OrderService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMenu();
    this.subscriptions.add(this.cartService.cartItems$.subscribe(items => this.cartItems = items));
    this.setupCustomerSearch();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadMenu(): void {
    this.isLoadingMenu = true;
    this.menuService.getMenuItems().subscribe({
      next: (data) => {
        this.menuItems = data.filter(item => item.isAvailable);
        this.isLoadingMenu = false;
      },
      error: (err) => this.handleError('Failed to load menu items.', () => this.isLoadingMenu = false)
    });
  }

  setupCustomerSearch(): void {
    const searchSubscription = this.customerSearchTerm.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.isSearching = true),
      switchMap(term => {
        if (term.length < 2) {
          this.foundUsers = [];
          return [];
        }
        return this.userService.searchUsers(term).pipe(
          catchError(() => {
            this.handleError('Customer search failed.');
            return [];
          })
        );
      }),
      tap(() => this.isSearching = false)
    ).subscribe(users => {
      this.foundUsers = users;
    });
    this.subscriptions.add(searchSubscription);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.customerSearchTerm.next(value);
  }

  selectCustomer(user: User): void {
    this.selectedCustomer = user;
    this.guestName = '';
    this.foundUsers = [];
  }

  clearCustomer(): void {
    this.selectedCustomer = null;
    this.guestName = '';
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) {
      this.handleError('Cannot place an empty order.');
      return;
    }
    if (!this.selectedCustomer && !this.guestName.trim()) {
      this.handleError('Please select a customer or enter a guest name.');
      return;
    }

    this.isPlacingOrder = true;

    const payload: PlaceOrderPayload = {
      items: this.cartItems.map(item => ({ menuItemId: item.id, quantity: item.quantity })),
      total: this.calculateTotal(),
      customerId: this.selectedCustomer?.id,
      guestName: this.guestName.trim() || undefined
    };

    this.orderService.placeOrder(payload).subscribe({
      next: () => {
        this.showFeedback('Order placed successfully!');
        this.cartService.clearCart();
        this.clearCustomer();
        this.isPlacingOrder = false;
      },
      error: (err) => this.handleError('Failed to place order.', () => this.isPlacingOrder = false)
    });
  }

  // Cart Management
  addToCart(item: MenuItem): void { this.cartService.addItem(item); }
  removeFromCart(item: any): void { this.cartService.removeItem(item); }
  calculateTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Navigation & Feedback
  goBack(): void { this.router.navigate(['/admin-dashboard']); }

  private showFeedback(message: string): void {
    this.feedbackMessage = message;
    setTimeout(() => this.feedbackMessage = null, 3000);
  }

  private handleError(message: string, onComplete?: () => void): void {
    this.errorMessage = message;
    if (onComplete) onComplete();
    setTimeout(() => this.errorMessage = null, 5000);
  }
}
