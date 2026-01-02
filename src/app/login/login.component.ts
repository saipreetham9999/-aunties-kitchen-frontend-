import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router'; // Import Router and ActivatedRoute
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service'; // Import AuthService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  message = '';

  constructor(
    private router: Router,
    private authService: AuthService, // Inject AuthService
    private route: ActivatedRoute // Inject ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for a 'verified' query parameter from OTP verification
    this.route.queryParamMap.subscribe(params => {
      if (params.get('verified') === 'true') {
        this.message = 'Email successfully verified! You can now log in.';
      }
    });
  }

  onLogin() {
    console.log('Login button clicked!');
    const credentials = {
      email: this.email,
      password: this.password
    };

    this.message = 'Attempting to log in...';
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.message = response.message || 'Login successful!';
        // In a real app, you'd store the token (response.accessToken) here
        // localStorage.setItem('accessToken', response.accessToken);

        const userRole = this.authService.getUserRole();
        console.log('User role after login:', userRole);

        if (userRole === 'CUSTOMER') {
          this.router.navigate(['/customer-dashboard']); // Redirect customer to their dashboard
        } else {
          this.router.navigate(['/home']); // Default redirect for other roles or if role is not found
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.message = error.error?.message || 'Login failed. Invalid credentials or account not verified.';
      }
    });
  }
}
