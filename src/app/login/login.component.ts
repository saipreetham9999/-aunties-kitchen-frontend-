import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

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
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      if (params.get('verified') === 'true') {
        this.message = 'Email successfully verified! You can now log in.';
      }
    });
  }

  onLogin() {
    this.message = 'Attempting to log in...';
    const credentials = { email: this.email, password: this.password };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.message = response.message || 'Login successful!';

        const userRole = this.authService.getUserRole();
        console.log('User role from AuthService:', userRole);

        switch (userRole) {
          case 'ROLE_CUSTOMER':
            this.router.navigate(['/customer-dashboard']);
            break;
          case 'ROLE_ADMIN':
            this.router.navigate(['/admin-dashboard']);
            break;
          case 'ROLE_KITCHEN':
            this.router.navigate(['/kitchen-dashboard']);
            break;
          case 'ROLE_CASHIER':
            this.router.navigate(['/cashier-dashboard']);
            break;
          default:
            console.warn('Login successful, but no role found or role not recognized. Redirecting to home.');
            this.router.navigate(['/home']); // Fallback
            break;
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.message = error.error?.message || 'Login failed. Please check your credentials or verify your account.';
      }
    });
  }
}
