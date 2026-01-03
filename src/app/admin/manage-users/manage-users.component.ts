import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService, User } from '../user.service';
import { AuthService } from '../../auth/auth.service'; // Import AuthService

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  customers: User[] = [];
  allCustomers: User[] = []; // To store the full list of customers for searching
  userOtps: { [key: string]: string } = {};
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;

  showUserList: boolean = false; // Controls visibility of the user list section
  searchEmail: string = ''; // Binds to the search input field

  constructor(
    private userService: UserService,
    private authService: AuthService, // Inject AuthService
    private fb: FormBuilder, // Keep FormBuilder for potential future use or if other forms exist
    private router: Router
  ) {
    // createUserForm is no longer needed here as creation is handled by navigation to /register
  }

  ngOnInit(): void {
    // No initial load, users will be loaded when 'Display Users' is clicked
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
         console.log('Raw data received from backend:', data);
        // FIX: Change filter condition from 'ROLE_CUSTOMER' to 'CUSTOMER'
        this.allCustomers = data.filter(u => u.role === 'CUSTOMER');
        console.log('Filtered customers:', this.allCustomers);
        this.customers = [...this.allCustomers]; // Display all customers initially

      },
      error: (err) => this.handleError('Failed to load users.')
    });
  }

  onDisplayUsers(): void {
    this.showUserList = true;
    this.searchEmail = ''; // Clear search when displaying all
    this.loadUsers();
  }

  onSearchUsers(): void {
    if (this.searchEmail.trim() === '') {
      this.customers = [...this.allCustomers]; // If search is empty, show all
    } else {
      this.customers = this.allCustomers.filter(user =>
        user.email.toLowerCase().includes(this.searchEmail.toLowerCase())
      );
    }
  }

  onVerifyUser(user: User): void {
    const otp = this.userOtps[user.id];
    if (!otp) {
      this.handleError('Please enter the OTP.');
      return;
    }
    this.userService.verifyUserOtp(user.email, otp).subscribe({
      next: (response) => {
        this.showFeedback(response.message || `User ${user.name} verified.`);
        // Update the status in both lists
        const verifiedUserInCustomers = this.customers.find(u => u.id === user.id);
        if (verifiedUserInCustomers) verifiedUserInCustomers.emailVerified = true;
        const verifiedUserInAllCustomers = this.allCustomers.find(u => u.id === user.id);
        if (verifiedUserInAllCustomers) verifiedUserInAllCustomers.emailVerified = true;
      },
      error: (err) => this.handleError(err.error?.message || 'Invalid OTP.')
    });
  }

  onDeleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete the customer ${user.name}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.showFeedback(`Customer ${user.name} has been deleted.`);
          this.customers = this.customers.filter(u => u.id !== user.id);
          this.allCustomers = this.allCustomers.filter(u => u.id !== user.id); // Also remove from allCustomers
        },
        error: (err) => this.handleError(`Failed to delete user.`)
      });
    }
  }

  onViewOrders(user: User): void {
    this.router.navigate(['/admin/orders/user', user.id]);
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
