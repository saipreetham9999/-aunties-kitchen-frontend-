import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User, CleanRole, PrefixedRole } from '../user.service';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit, OnDestroy {

  customers: User[] = [];
  private allCustomers: User[] = [];
  private pollingSubscription?: Subscription;

  isLoading = false;
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;

  searchEmail: string = '';
  availableRoles: CleanRole[] = ['CUSTOMER', 'KITCHEN', 'CASHIER'];

  constructor(
    private userService: UserService,
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
    this.pollingSubscription = timer(0, 180000) // 0ms initial delay, then every 3 minutes
      .pipe(switchMap(() => this.userService.getUsers()))
      .subscribe({
        next: (data) => this.handleUserData(data),
        error: (err) => this.handleError('Failed to auto-refresh users.')
      });
  }

  stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
  }

  handleUserData(data: User[]): void {
    this.allCustomers = data;
    this.customers = this.allCustomers.filter(u => u.role === 'ROLE_CUSTOMER');
    this.isLoading = false;
    if (this.customers.length === 0) {
      this.showFeedback('No customer accounts found.');
    }
    this.cdr.detectChanges(); // Manually trigger change detection
  }

  onSearch(): void {
    if (this.searchEmail.trim() === '') {
      this.customers = this.allCustomers.filter(u => u.role === 'ROLE_CUSTOMER');
    } else {
      this.customers = this.allCustomers.filter(user =>
        user.role === 'ROLE_CUSTOMER' &&
        user.email.toLowerCase().includes(this.searchEmail.toLowerCase())
      );
    }
    this.cdr.detectChanges(); // Manually trigger change detection
  }

  onRoleChange(user: User, event: Event): void {
    const newRole = (event.target as HTMLSelectElement).value as CleanRole;
    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        this.showFeedback(`Role for ${user.name} updated to ${newRole}.`);
        const userIndex = this.customers.findIndex(u => u.id === user.id);
        if (userIndex > -1) {
          this.customers[userIndex].role = `ROLE_${newRole}` as PrefixedRole;
          this.customers = this.customers.filter(u => u.role === 'ROLE_CUSTOMER');
        }
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err) => {
        this.handleError('Failed to update role.');
        this.userService.getUsers().subscribe(data => this.handleUserData(data));
      }
    });
  }

  onDeleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete the customer ${user.name}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.showFeedback(`Customer ${user.name} has been deleted.`);
          this.allCustomers = this.allCustomers.filter(u => u.id !== user.id);
          this.customers = this.customers.filter(u => u.id !== user.id);
          this.cdr.detectChanges(); // Manually trigger change detection
        },
        error: (err) => this.handleError(`Failed to delete user.`)
      });
    }
  }

  onViewOrders(user: User): void {
    this.router.navigate(['/admin/orders/user', user.id]);
  }

  navigateToCreateUser(): void {
    this.router.navigate(['/register']);
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
