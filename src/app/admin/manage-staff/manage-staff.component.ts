import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User, CleanRole, PrefixedRole } from '../user.service';

@Component({
  selector: 'app-manage-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-staff.component.html',
  styleUrls: ['../manage-users/manage-users.component.css']
})
export class ManageStaffComponent implements OnInit {

  staff: User[] = [];
  createUserForm: FormGroup;
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;

  availableRolesForUpdate: CleanRole[] = ['KITCHEN', 'CASHIER', 'ADMIN'];

  showOtpModal = false;
  userToPromote: User | null = null;
  otpForPromotion = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {
    this.createUserForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['KITCHEN' as CleanRole, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.staff = data.filter(u => u.role !== 'ROLE_CUSTOMER');
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err: any) => this.handleError('Failed to load staff members.')
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
        this.createUserForm.reset({ role: 'KITCHEN' });
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err: any) => this.handleError(err.error?.message || 'Failed to create staff member.')
    });
  }

  onRoleChange(user: User, event: Event): void {
    const newRole = (event.target as HTMLSelectElement).value as CleanRole;
    if (newRole === 'ADMIN') {
      this.initiateAdminPromotion(user);
    } else {
      this.updateUserRole(user, newRole);
    }
  }

  updateUserRole(user: User, newRole: CleanRole): void {
    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        this.showFeedback(`Role updated for ${user.name}.`);
        const userIndex = this.staff.findIndex(u => u.id === user.id);
        if (userIndex > -1) {
          this.staff = this.staff.map((staffUser, index) => {
            if (index === userIndex) {
              return { ...staffUser, role: `ROLE_${newRole}` as PrefixedRole };
            }
            return staffUser;
          });
        }
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err: any) => {
        this.handleError(err.error?.message || 'Failed to update role.');
        this.loadStaff();
      }
    });
  }

  initiateAdminPromotion(user: User): void {
    this.userToPromote = user;
    this.userService.initiateAdminPromotion(user.id).subscribe({
      next: (response) => {
        this.showFeedback(response.message || 'An OTP has been sent to the current admin\'s email for confirmation.');
        this.showOtpModal = true;
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err: any) => {
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
      error: (err: any) => this.handleError(err.error?.message || 'OTP verification failed.')
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
          this.cdr.detectChanges(); // Manually trigger change detection
        },
        error: (err: any) => this.handleError('Failed to delete staff member.')
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  private updateUserInList(userId: string, changes: Partial<User>): void {
    const user = this.staff.find(u => u.id === userId);
    if (user) Object.assign(user, changes);
    this.cdr.detectChanges(); // Manually trigger change detection
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
