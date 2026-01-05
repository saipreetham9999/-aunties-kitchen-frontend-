import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User } from '../user.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  customers: User[] = [];
  private allCustomers: User[] = []; // Private store of all customers

  isLoading = false;
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;

  searchEmail: string = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.allCustomers = data.filter(u => u.role === 'ROLE_CUSTOMER');
        this.customers = [...this.allCustomers]; // Refresh the displayed list
        this.isLoading = false;
        if (this.customers.length === 0) {
          this.showFeedback('No customer accounts found.');
        }
      },
      error: (err: any) => {
        this.handleError('Failed to load users.');
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchEmail.trim() === '') {
      this.customers = [...this.allCustomers];
    } else {
      this.customers = this.allCustomers.filter(user =>
        user.email.toLowerCase().includes(this.searchEmail.toLowerCase())
      );
    }
  }

  onDeleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete the customer ${user.name}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.showFeedback(`Customer ${user.name} has been deleted.`);
          // Remove from both lists to keep them in sync
          this.allCustomers = this.allCustomers.filter(u => u.id !== user.id);
          this.customers = this.customers.filter(u => u.id !== user.id);
        },
        error: (err: any) => this.handleError(`Failed to delete user.`)
      });
    }
  }

  onViewOrders(user: User): void {
    this.router.navigate(['/admin/orders/user', user.id]);
  }

  navigateToCreateStaff(): void {
    this.router.navigate(['/admin/staff']);
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
