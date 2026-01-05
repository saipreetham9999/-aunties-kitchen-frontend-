import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { ManageUsersComponent } from './manage-users.component';
import { UserService, User } from '../user.service';

const mockUsers: User[] = [
  { id: '1', name: 'Nikhil Kumar', email: 'nikhil@example.com', role: 'ROLE_CUSTOMER', emailVerified: true },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'ROLE_CUSTOMER', emailVerified: false },
];

describe('ManageUsersComponent', () => {
  let component: ManageUsersComponent;
  let fixture: ComponentFixture<ManageUsersComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(waitForAsync(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers', 'deleteUser']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        ManageUsersComponent // Import standalone component
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageUsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and display users on init', () => {
    userService.getUsers.and.returnValue(of(mockUsers));
    fixture.detectChanges(); // Triggers ngOnInit

    expect(component.customers.length).toBe(2);
    expect(component.customers[0].name).toBe('Nikhil Kumar');

    const compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(2);
    expect(compiled.querySelector('tbody tr:first-child td:first-child').textContent).toContain('Nikhil Kumar');
  });

  it('should filter users based on search input', () => {
    userService.getUsers.and.returnValue(of(mockUsers));
    fixture.detectChanges();

    component.searchEmail = 'jane';
    component.onSearch();
    fixture.detectChanges();

    expect(component.customers.length).toBe(1);
    expect(component.customers[0].name).toBe('Jane Doe');

    const compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('should call deleteUser and remove user from list on success', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    userService.getUsers.and.returnValue(of([...mockUsers]));
    userService.deleteUser.and.returnValue(of({}));
    fixture.detectChanges();

    const userToDelete = mockUsers[1];
    component.onDeleteUser(userToDelete);
    fixture.detectChanges();

    expect(userService.deleteUser).toHaveBeenCalledWith(userToDelete.id);
    expect(component.customers.length).toBe(1);
    expect(component.customers.find(u => u.id === userToDelete.id)).toBeUndefined();
  });

  it('should show an error message if loading users fails', () => {
    userService.getUsers.and.returnValue(throwError(() => new Error('Failed to load')));
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Failed to load users.');
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.feedback-message.error').textContent).toContain('Failed to load users.');
  });
});
