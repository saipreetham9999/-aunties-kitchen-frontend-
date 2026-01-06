import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../orders/order.service';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

type SortKey = 'date' | 'total';
type SortOrder = 'asc' | 'desc';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.css']
})
export class ManageOrdersComponent implements OnInit, OnDestroy {

  private allOrders: Order[] = [];
  filteredOrders: Order[] = [];

  private pollingSubscription?: Subscription;

  isLoading = true;
  errorMessage: string | null = null;

  // Filtering and Sorting
  filterStatus = 'ALL';
  filterUser = '';
  sortKey: SortKey = 'date';
  sortOrder: SortOrder = 'desc';

  // For the detailed view modal
  selectedOrder: Order | null = null;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  startPolling(): void {
    this.pollingSubscription = timer(0, 60000) // 0ms initial delay, then every 1 minute
      .pipe(
        switchMap(() => this.orderService.getAllOrders())
      )
      .subscribe({
        next: (data) => {
          this.allOrders = data;
          this.applyFiltersAndSorting();
          this.isLoading = false;
          this.cdr.detectChanges(); // Manually trigger change detection
        },
        error: (err) => {
          this.errorMessage = 'Failed to auto-refresh orders. Please try again later.';
          this.isLoading = false;
          this.cdr.detectChanges(); // Manually trigger change detection
        }
      });
  }

  stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
  }

  applyFiltersAndSorting(): void {
    let orders = [...this.allOrders];

    // Apply status filter
    if (this.filterStatus !== 'ALL') {
      orders = orders.filter(order => order.status === this.filterStatus);
    }

    // Apply user filter (case-insensitive)
    if (this.filterUser.trim()) {
      const searchTerm = this.filterUser.toLowerCase();
      orders = orders.filter(order =>
        order.customerName?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    orders.sort((a, b) => {
      const valA = a[this.sortKey];
      const valB = b[this.sortKey];

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredOrders = orders;
  }

  onFilterChange(): void {
    this.applyFiltersAndSorting();
  }

  onSortChange(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortOrder = 'desc'; // Default to descending for new sort keys
    }
    this.applyFiltersAndSorting();
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
  }

  closeModal(): void {
    this.selectedOrder = null;
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}
