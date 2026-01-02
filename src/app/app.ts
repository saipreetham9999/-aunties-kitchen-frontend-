import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component'; // Import OtpVerificationComponent

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LoginComponent, RegisterComponent, OtpVerificationComponent], // Add OtpVerificationComponent to imports
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('aunties-kitchen-frontend');
}
