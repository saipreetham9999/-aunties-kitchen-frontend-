import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService, User } from '../user.service';

@Component({
  selector: 'app-manage-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './manage-staff.component.html',
  styleUrls: ['../manage-users/manage-users.component.css']
})
export class ManageStaffComponent implements OnInit {

  staff: User[] = [];
  createUserForm: FormGroup;
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;

  availableRoles = ['ROLE_KITCHEN', 'ROLE_CASHIER', 'ROLE_ADMIN'];

  showOtpModal = false;
  userToPromote: User | null = null;
  otpForPromotion = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.createUserForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ROLE_KITCHEN', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.staff = data.filter(u => u.role !== 'ROLE_CUSTOMER');
      },
      error: (err) => this.handleError('Failed to load staff members.')
    });
  }

  onCreateStaff(): void {
    if (this.createUserForm.invalid) {
      this.handleError('Please fill out all fields correctly.');
      return;
    }
    this.userService.createUser(this.createUserForm.value).subscribe({
      next: (newUser) => {
        this.showFeedback(`Staff member ${newUser.name} created.`);
        this.staff.push(newUser);
        this.createUserForm.reset({ role: 'ROLE_KITCHEN' });
      },
      error: (err) => this.handleError(err.error?.message || 'Failed to create staff member.')
    });
  }

  onRoleChange(user: User, event: Event): void {
    const newRole = (event.target as HTMLSelectElement).value;
    if (newRole === 'ROLE_ADMIN') {
      this.initiateAdminPromotion(user);
    } else {
      this.updateUserRole(user, newRole);
    }
  }

  updateUserRole(user: User, newRole: string): void {
    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        this.showFeedback(`Role updated for ${user.name}.`);
        this.updateUserInList(user.id, { role: newRole });
      },
      error: (err) => {
        this.handleError(err.error?.message || 'Failed to update role.');
        this.loadStaff();
      }
    });
  }

  initiateAdminPromotion(user: User): void {
    this.userToPromote = user;
    this.userService.initiateAdminPromotion(user.id).subscribe({
      next: (response) => {
        this.showFeedback(response.message || 'OTP sent to your email.');
        this.showOtpModal = true;
      },
      error: (err) => {
        this.handleError(err.error?.message || 'Failed to initiate promotion.');
        this.loadStaff();
      }
    });
  }

  onCompletePromotion(): void {
    if (!this.userToPromote || !this.otpForPromotion) return;
    this.userService.completeAdminPromotion(this.userToPromote.id, this.otpForPromotion).subscribe({
      next: (response) => {
        this.showFeedback(response.message || 'Promotion successful.');
        this.updateUserInList(this.userToPromote!.id, { role: 'ROLE_ADMIN' });
        this.closeOtpModal();
      },
      error: (err) => this.handleError(err.error?.message || 'OTP verification failed.')
    });
  }

  closeOtpModal(): void {
    this.showOtpModal = false;
    this.userToPromote = null;
    this.otpForPromotion = '';
    this.loadStaff();
  }

  onDeleteStaff(user: User): void {
    if (confirm(`Are you sure you want to delete the staff member ${user.name}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.showFeedback(`Staff member ${user.name} has been deleted.`);
          this.staff = this.staff.filter(u => u.id !== user.id);
        },
        error: (err) => this.handleError('Failed to delete staff member.')
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  private updateUserInList(userId: string, changes: Partial<User>): void {
    const user = this.staff.find(u => u.id === userId);
    if (user) Object.assign(user, changes);
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
