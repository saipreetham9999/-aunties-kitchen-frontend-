import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { ManageStaffComponent } from './manage-staff.component';
import { UserService, User } from '../user.service';

const mockStaff: User[] = [
  { id: '10', name: 'Kitchen Person', email: 'kitchen@example.com', role: 'ROLE_KITCHEN', emailVerified: true },
  { id: '11', name: 'Cashier Person', email: 'cashier@example.com', role: 'ROLE_CASHIER', emailVerified: true },
];

describe('ManageStaffComponent', () => {
  let component: ManageStaffComponent;
  let fixture: ComponentFixture<ManageStaffComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(waitForAsync(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'getUsers',
      'createUser',
      'updateUserRole',
      'initiateAdminPromotion',
      'completeAdminPromotion'
    ]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        ManageStaffComponent
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageStaffComponent);
    component = fixture.componentInstance;
    userService.getUsers.and.returnValue(of(mockStaff));
    fixture.detectChanges();
  });

  it('should create and load staff', () => {
    expect(component).toBeTruthy();
    expect(component.staff.length).toBe(2);
    const compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('should create a new staff member and add it to the list', () => {
    const newStaff: User = { id: '12', name: 'New Staff', email: 'new@example.com', role: 'ROLE_KITCHEN', emailVerified: true };
    userService.createUser.and.returnValue(of(newStaff));

    component.createUserForm.setValue({
      name: 'New Staff',
      email: 'new@example.com',
      password: 'password123',
      role: 'KITCHEN'
    });
    component.onCreateStaff();
    fixture.detectChanges();

    expect(userService.createUser).toHaveBeenCalled();
    expect(component.staff.length).toBe(3);
    expect(component.staff[2].name).toBe('New Staff');
  });

  it('should initiate admin promotion and show OTP modal', () => {
    const userToPromote = mockStaff[0];
    userService.initiateAdminPromotion.and.returnValue(of({ message: 'OTP sent' }));

    component.onRoleChange(userToPromote, { target: { value: 'ADMIN' } } as any);
    fixture.detectChanges();

    expect(userService.initiateAdminPromotion).toHaveBeenCalledWith(userToPromote.id);
    expect(component.showOtpModal).toBeTrue();
    expect(component.userToPromote).toBe(userToPromote);
  });

  it('should complete admin promotion on valid OTP', () => {
    const userToPromote = mockStaff[0];
    component.userToPromote = userToPromote;
    component.otpForPromotion = '123456';

    userService.completeAdminPromotion.and.returnValue(of({ message: 'Promotion successful' }));

    component.onCompletePromotion();
    fixture.detectChanges();

    expect(userService.completeAdminPromotion).toHaveBeenCalledWith(userToPromote.id, '123456');
    expect(component.showOtpModal).toBeFalse();
    // The user's role in the list should be updated
    expect(component.staff.find(u => u.id === userToPromote.id)?.role).toBe('ROLE_ADMIN');
  });
});
