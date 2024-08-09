import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../services/data/data.service';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { dateValidator, inArrayValidator } from '../../../../utils/custom-validators';
import { PopupService } from '../../../../services/popup/popup.service';

@Component({
  selector: 'app-payroll-forms',
  templateUrl: './payroll-forms.component.html',
  styleUrl: './payroll-forms.component.scss'
})
export class PayrollFormsComponent implements OnInit{

  constructor (
    private ds: DataService,
    private fb: FormBuilder,
    private pop: PopupService
  ) { }

  form = this.fb.group({
    forms: this.fb.array([])
  });

  transactions: any;

  ngOnInit(): void {
    this.ds.request('GET', 'admin/transactions/user/' + 'user_id', null).subscribe({
      next: (res: any) => { this.transactions = res.data },
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
