import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserOrdersComponent } from './admin/user-orders/user-orders.component';
import { ManageUsersComponent } from './admin/manage-users/manage-users.component';
import { ManageStaffComponent } from './admin/manage-staff/manage-staff.component';
import { ManageMenuComponent } from './admin/manage-menu/manage-menu.component';
import { ManageOrdersComponent } from './admin/manage-orders/manage-orders.component';
import { KitchenDashboardComponent } from './admin/kitchen-dashboard/kitchen-dashboard.component';
import { CashierDashboardComponent } from './admin/cashier-dashboard/cashier-dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-otp', component: OtpVerificationComponent },
  { path: 'customer-dashboard', component: CustomerDashboardComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },

  // Admin sub-routes
  { path: 'admin/users', component: ManageUsersComponent },
  { path: 'admin/staff', component: ManageStaffComponent },
  { path: 'admin/menu', component: ManageMenuComponent },
  { path: 'admin/orders', component: ManageOrdersComponent },
  { path: 'admin/orders/user/:userId', component: UserOrdersComponent },
  { path: 'admin/kitchen-dashboard', component: KitchenDashboardComponent },
  { path: 'admin/cashier-dashboard', component: CashierDashboardComponent },

  { path: 'home', component: LoginComponent }, // Placeholder
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
