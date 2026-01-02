import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cashier-dashboard.component.html',
  styleUrls: ['./cashier-dashboard.component.css']
})
export class CashierDashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
