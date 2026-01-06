import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuService, MenuItem } from '../menu/menu.service';
import { OrderService, PlaceOrderPayload, OrderItem } from '../orders/order.service';
import { UserService, User } from '../admin/user.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier-dashboard.component.html',
  styleUrls: ['./cashier-dashboard.component.css']
})
export class CashierDashboardComponent implements OnInit, OnDestroy {

  // Order Creation
  currentOrderItems: OrderItem[] = [];
  totalPrice = 0;

  // Menu Item Search
  menuSearchTerm = '';
  foundMenuItem: MenuItem | null = null;
  menuSearchError: string | null = null;

  // Customer Search
  customerSearchTerm = '';
  foundCustomers: User[] = [];
  selectedCustomer: User | null = null;
  isGuestOrder = true;
  guestName = '';
  private customerSearchSubject = new Subject<string>();
  private customerSearchSubscription?: Subscription;

  // State Management
  isPlacingOrder = false;
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private menuService: MenuService,
    private orderService: OrderService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.customerSearchSubscription = this.customerSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => term ? this.userService.searchUsers(term) : [])
    ).subscribe({
      next: users => {
        this.foundCustomers = users;
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: () => {
        this.foundCustomers = [];
        this.cdr.detectChanges(); // Manually trigger change detection
      }
    });
  }

  ngOnDestroy(): void {
    this.customerSearchSubscription?.unsubscribe();
  }

  onMenuSearch(): void {
    if (!this.menuSearchTerm.trim()) return;
    this.menuService.searchMenuItemByCode(this.menuSearchTerm).subscribe({
      next: (item: MenuItem) => {
        this.foundMenuItem = item;
        this.menuSearchError = null;
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: () => {
        this.foundMenuItem = null;
        this.menuSearchError = `Item with code "${this.menuSearchTerm}" not found.`;
        this.cdr.detectChanges(); // Manually trigger change detection
      }
    });
  }

  addItemToOrder(item: MenuItem): void {
    if (!item) return;
    const existingItem = this.currentOrderItems.find(oi => oi.menuItemId === item.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.currentOrderItems.push({
        menuItemId: item.id!,
        menuItemName: item.name,
        quantity: 1,
        price: item.price
      });
    }
    this.calculateTotal();
    this.resetMenuSearch();
  }

  updateQuantity(item: OrderItem, change: number): void {
    item.quantity += change;
    if (item.quantity <= 0) {
      this.currentOrderItems = this.currentOrderItems.filter(oi => oi.menuItemId !== item.menuItemId);
    }
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalPrice = this.currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  onCustomerSearch(): void {
    this.customerSearchSubject.next(this.customerSearchTerm);
  }

  selectCustomer(customer: User): void {
    this.selectedCustomer = customer;
    this.isGuestOrder = false;
    this.customerSearchTerm = customer.name;
    this.foundCustomers = [];
  }

  setOrderType(isGuest: boolean): void {
    this.isGuestOrder = isGuest;
    this.selectedCustomer = null;
    this.customerSearchTerm = '';
    this.guestName = '';
  }

  placeOrder(): void {
    if (this.currentOrderItems.length === 0) {
      this.handleError('Cannot place an empty order.');
      return;
    }
    if (!this.isGuestOrder && !this.selectedCustomer) {
      this.handleError('Please select a customer or switch to a guest order.');
      return;
    }
    if (this.isGuestOrder && !this.guestName.trim()) {
      this.handleError('Please enter a name for the guest order.');
      return;
    }

    this.isPlacingOrder = true;
    const payload: PlaceOrderPayload = {
      items: this.currentOrderItems.map(item => ({ menuItemId: item.menuItemId, quantity: item.quantity })),
      total: this.totalPrice,
      ...(this.isGuestOrder ? { guestName: this.guestName } : { customerId: this.selectedCustomer!.id })
    };

    this.orderService.placeOrder(payload).subscribe({
      next: (newOrder) => {
        this.showFeedback(`Successfully placed order #${newOrder.id.substring(0, 6)}.`);
        this.resetOrder();
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err) => {
        this.handleError(err.message || 'Failed to place order.');
        this.isPlacingOrder = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      complete: () => {
        this.isPlacingOrder = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      }
    });
  }

  resetMenuSearch(): void {
    this.menuSearchTerm = '';
    this.foundMenuItem = null;
    this.menuSearchError = null;
  }

  resetOrder(): void {
    this.currentOrderItems = [];
    this.totalPrice = 0;
    this.setOrderType(true);
    this.resetMenuSearch();
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  private showFeedback(message: string): void {
    this.feedbackMessage = message;
    setTimeout(() => this.feedbackMessage = null, 4000);
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = null, 5000);
  }
}
