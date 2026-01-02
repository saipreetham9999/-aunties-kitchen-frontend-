import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component'; // Import OtpVerificationComponent
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component'; // Import CustomerDashboardComponent

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-otp', component: OtpVerificationComponent }, // Add route for OTP verification
  { path: 'customer-dashboard', component: CustomerDashboardComponent }, // Add route for customer dashboard
  { path: 'home', component: LoginComponent }, // Placeholder for home, can be changed later
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } // Redirect any unknown paths to login
];
