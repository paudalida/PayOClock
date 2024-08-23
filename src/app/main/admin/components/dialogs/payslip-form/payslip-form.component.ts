import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payslip-form',
  templateUrl: './payslip-form.component.html',
  styleUrl: './payslip-form.component.scss'
})
export class PayslipFormComponent implements OnInit{

  constructor(
    private as: AdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    throw new Error('Method not implemented.'); // papalitan nalngs c
  }

  redirectToPayslipHistory() {
    this.router.navigate(['/admin/payrolls/payslip-history']);
  }
}