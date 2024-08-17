import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { inArrayValidator, dateValidator } from '../../../../../utils/custom-validators';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';
import { OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin/admin.service';

@Component({
  selector: 'app-payroll-forms',
  templateUrl: './payroll-forms.component.html',
  styleUrl: './payroll-forms.component.scss'
})
export class PayrollFormsComponent implements OnInit{

  constructor (
    private ds: DataService,
    private as: AdminService,
    private fb: FormBuilder,
    private pop: PopupService
  ) { }

  form = this.fb.group({
    forms: this.fb.array([])
  });

  transactions: any;
  employee: any;

  ngOnInit(): void {
    this.employee = this.as.getEmployee();
    this.ds.request('GET', 'admin/transactions/user/' + this.employee.id).subscribe({
      next: (res: any) => { this.transactions = res.data; console.log(this.employee); console.log(this.transactions); },
      error: (err: any) => this.pop.toastWithTimer('error', 'Error fetching employee transactions')
    })  
  }

  addToFormsArray(formKey: string, type: string) {
    const formsArray = this.form.get('forms') as FormArray;

    formsArray.push({
      'formKey': [formKey],
      'id': [''],
      'user_id': ['', Validators.required], // Wala pa pero dito yung id ng user
      'transaction_type': [type, inArrayValidator(['deduction', 'addition'])], // addition or deduction
      'type': ['', [Validators.required, Validators.maxLength(30)]],
      'amount': ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      'payday': ['', [dateValidator()]]
    })
  }
}
