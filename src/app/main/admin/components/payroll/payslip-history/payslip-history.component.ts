import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payslip-history',
  templateUrl: './payslip-history.component.html',
  styleUrl: './payslip-history.component.scss'
})
export class PayslipHistoryComponent implements OnInit{

  constructor(
    private as: AdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    throw new Error('Method not implemented.'); // papalitan nalngs c
  }

  redirectToPayroll() {
    this.router.navigate(['/admin/payrolls']);
  }
}
