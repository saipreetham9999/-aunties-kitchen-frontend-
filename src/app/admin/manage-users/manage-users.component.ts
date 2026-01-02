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
  createUserForm: FormGroup;
  userOtps: { [key: string]: string } = {};
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;

  showCreateUserSection: boolean = false; // New flag to control visibility

  constructor(
    private userService: UserService,
    private authService: AuthService, // Inject AuthService
    private fb: FormBuilder,
    private router: Router
  ) {
    this.createUserForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.customers = data.filter(u => u.role === 'ROLE_CUSTOMER');
      },
      error: (err) => this.handleError('Failed to load users.')
    });
  }

  onCreateUser(): void {
    if (this.createUserForm.invalid) {
      this.handleError('Please fill out all fields correctly.');
      return;
    }
    const userData = {
      name: this.createUserForm.value.name,
      email: this.createUserForm.value.email,
      password: this.createUserForm.value.password
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.showFeedback(response.message || `Customer ${userData.name} created. An OTP has been sent to their email for verification.`);
        this.loadUsers(); // Reload users to get the newly created (unverified) user
        this.createUserForm.reset();
        this.showCreateUserSection = false; // Hide the form after creation
      },
      error: (err) => this.handleError(err.error?.message || 'Failed to create user. The email might already be in use.')
    });
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
        const verifiedUser = this.customers.find(u => u.id === user.id);
        if (verifiedUser) verifiedUser.emailVerified = true;
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

  toggleCreateUserSection(): void {
    this.showCreateUserSection = !this.showCreateUserSection;
    if (this.showCreateUserSection) {
      this.createUserForm.reset(); // Clear form when showing
    }
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
