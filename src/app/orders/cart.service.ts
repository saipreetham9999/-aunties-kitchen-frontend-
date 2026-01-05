import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItems.asObservable();

  constructor() { }

  addItem(item: any) {
    const currentItems = this.cartItems.getValue();
    const existingItem = currentItems.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      item.quantity = 1;
      currentItems.push(item);
    }
    this.cartItems.next(currentItems);
  }

  removeItem(item: any) {
    let currentItems = this.cartItems.getValue();
    const existingItem = currentItems.find(i => i.id === item.id);
    if (existingItem && existingItem.quantity > 1) {
      existingItem.quantity--;
    } else {
      currentItems = currentItems.filter(i => i.id !== item.id);
    }
    this.cartItems.next(currentItems);
  }

  clearCart() {
    this.cartItems.next([]);
  }
}
