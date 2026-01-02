import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { KitchenDashboardComponent } from './kitchen-dashboard/kitchen-dashboard.component';
import { CashierDashboardComponent } from './cashier-dashboard/cashier-dashboard.component';
import { UserOrdersComponent } from './admin/user-orders/user-orders.component';
import { ManageUsersComponent } from './admin/manage-users/manage-users.component';
import { ManageStaffComponent } from './admin/manage-staff/manage-staff.component';
import { ManageMenuComponent } from './admin/manage-menu/manage-menu.component';
import { ManageOrdersComponent } from './admin/manage-orders/manage-orders.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-otp', component: OtpVerificationComponent },
  { path: 'customer-dashboard', component: CustomerDashboardComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'kitchen-dashboard', component: KitchenDashboardComponent },
  { path: 'cashier-dashboard', component: CashierDashboardComponent },

  // Admin sub-routes
  { path: 'admin/users', component: ManageUsersComponent },
  { path: 'admin/staff', component: ManageStaffComponent },
  { path: 'admin/menu', component: ManageMenuComponent },
  { path: 'admin/orders', component: ManageOrdersComponent },
  { path: 'admin/orders/user/:userId', component: UserOrdersComponent },

  { path: 'home', component: LoginComponent }, // Placeholder
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
