import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  message = '';

  constructor(private router: Router, private authService: AuthService) {}

  onRegister() {
    console.log('RegisterComponent: Register button clicked.');
    if (this.isFormValid()) {
      const userData = {
        name: this.name,
        email: this.email,
        password: this.password
      };
      console.log('RegisterComponent: Form is valid. Preparing to send data:', userData);

      this.message = 'Registering user...';
      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('RegisterComponent: Registration successful. Navigating to OTP verification.');
          this.message = response.message || 'Registration successful! Please verify your email.';
          this.router.navigate(['/verify-otp'], { queryParams: { email: this.email } });
        },
        error: (error) => {
          console.error('RegisterComponent: Registration failed. Error details:', error);
          this.message = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      console.log('RegisterComponent: Form is invalid. Displaying validation message.');
      this.message = 'Please fill in all required fields and ensure passwords match.';
    }
  }

  isFormValid(): boolean {
    return this.name.length > 0 &&
           this.email.length > 0 &&
           this.password.length > 0 &&
           this.confirmPassword.length > 0 &&
           this.password === this.confirmPassword;
  }
}
