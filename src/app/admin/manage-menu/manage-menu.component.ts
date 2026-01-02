import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MenuService, MenuItem } from '../../menu/menu.service';

@Component({
  selector: 'app-manage-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './manage-menu.component.html',
  styleUrls: ['../manage-users/manage-users.component.css']
})
export class ManageMenuComponent implements OnInit {

  menuItems: MenuItem[] = [];
  menuItemForm: FormGroup;
  editingItem: MenuItem | null = null;
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private menuService: MenuService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.menuItemForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      category: ['Main Course', Validators.required],
      isActive: [true, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    this.menuService.getMenuItems().subscribe({
      next: (data) => { this.menuItems = data; },
      error: (err) => this.handleError('Failed to load menu items.')
    });
  }

  onFormSubmit(): void {
    if (this.menuItemForm.invalid) {
      this.handleError('Please fill out all fields correctly.');
      return;
    }
    if (this.editingItem) {
      this.onUpdateMenuItem();
    } else {
      this.onAddMenuItem();
    }
  }

  onAddMenuItem(): void {
    this.menuService.addMenuItem(this.menuItemForm.value).subscribe({
      next: (newItem) => {
        this.showFeedback(`Menu item "${newItem.name}" added.`);
        this.menuItems.push(newItem);
        this.resetForm();
      },
      error: (err) => this.handleError(err.error?.message || 'Failed to add menu item.')
    });
  }

  onUpdateMenuItem(): void {
    if (!this.editingItem) return;
    const updatedData = { ...this.editingItem, ...this.menuItemForm.value };
    this.menuService.updateMenuItem(updatedData).subscribe({
      next: (updatedItem) => {
        this.showFeedback(`Menu item "${updatedItem.name}" updated.`);
        const index = this.menuItems.findIndex(item => item.id === updatedItem.id);
        if (index > -1) {
          this.menuItems[index] = updatedItem;
        }
        this.resetForm();
      },
      error: (err) => this.handleError(err.error?.message || 'Failed to update menu item.')
    });
  }

  onEdit(item: MenuItem): void {
    this.editingItem = item;
    this.menuItemForm.patchValue(item);
  }

  onDelete(item: MenuItem): void {
    if (confirm(`Are you sure you want to delete the menu item "${item.name}"?`)) {
      this.menuService.deleteMenuItem(item.id!).subscribe({
        next: () => {
          this.showFeedback(`Menu item "${item.name}" has been deleted.`);
          this.menuItems = this.menuItems.filter(i => i.id !== item.id);
        },
        error: (err) => this.handleError('Failed to delete menu item.')
      });
    }
  }

  resetForm(): void {
    this.editingItem = null;
    this.menuItemForm.reset({
      category: 'Main Course',
      isActive: true
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  private showFeedback(message: string): void {
    this.feedbackMessage = message;
    setTimeout(() => this.feedbackMessage = null, 3000);
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = null, 5000);
  }
}
