import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Import AuthService

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.css']
})
export class OtpVerificationComponent implements OnInit {
  email: string | null = null;
  otp: string = '';
  message: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email');
    if (!this.email) {
      this.message = 'Email not provided. Please register again.';
      // Optionally redirect to registration if email is missing
      // this.router.navigate(['/register']);
    } else {
      this.message = `An OTP has been sent to your email: ${this.email}`;
    }
  }

  onVerifyOtp(): void {
    console.log('Verify OTP button clicked!');
    if (!this.email || !this.otp) {
      this.message = 'Please provide both email and OTP.';
      return;
    }

    const otpData = { email: this.email, otp: this.otp };
    this.message = `Verifying OTP for ${this.email}...`;

    this.authService.verifyOtp(otpData).subscribe({
      next: (response) => {
        this.message = response.message || 'OTP verified successfully! Redirecting to login...';
        this.router.navigate(['/login'], { queryParams: { verified: true } }); // Redirect to login on success
      },
      error: (error) => {
        console.error('OTP verification error:', error);
        this.message = error.error?.message || 'Invalid or expired OTP. Please try again.';
      }
    });
  }

  onResendOtp(): void {
    console.log('Resend OTP button clicked!');
    if (!this.email) {
      this.message = 'Cannot resend OTP without an email.';
      return;
    }

    this.message = `Resending OTP to ${this.email}...`;
    this.authService.resendOtp(this.email).subscribe({
      next: (response) => {
        this.message = response.message || `New OTP sent to ${this.email}. Please check your inbox.`;
      },
      error: (error) => {
        console.error('Resend OTP error:', error);
        this.message = error.error?.message || 'Failed to resend OTP. Please try again later.';
      }
    });
  }

  isOtpValid(): boolean {
    return this.otp.length === 6 && /^\d+$/.test(this.otp);
  }
}
