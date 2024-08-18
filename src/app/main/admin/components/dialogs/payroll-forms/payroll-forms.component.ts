import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { inArrayValidator, dateValidator } from '../../../../../utils/custom-validators';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';
import { OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';

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
    private pop: PopupService,
    private router: Router
  ) { }

  form = this.fb.group({
    forms: this.fb.array([])
  });

  transactions: any;
  employee: any;
  hourlyRate = 0;

  ngOnInit(): void {
    this.employee = this.as.getEmployee();

    if(!this.employee.id) { this.router.navigate(['/admin/payrolls']); } // return to payrolls if employee data is not set (browser refreshed)
    this.initializePeriodicalTransactions();
    this.hourlyRate = this.employee.hourly_rate;

    console.log(((this.form.get('forms') as FormArray).get('0') as FormGroup).get('transaction_type'))

    this.ds.request('GET', 'admin/transactions/user/' + this.employee.id).subscribe({
      next: (res: any) => { this.transactions = res.data; },
      error: (err: any) => this.pop.toastWithTimer('error', 'Error fetching employee transactions')
    })  
  }

  initializePeriodicalTransactions() {
    ['SSS', 'PHIC', 'HDMF'].forEach(type => {
      ['EE Share', 'ER Share'].forEach(subtype => {        
        this.addToFormsArray('add', '2024-08-30', 'contribution', type, subtype);
      });

      if(type == 'HDMF') {
        ['Salary', 'Calamity', 'Salary'].forEach(subtype => {
          this.addToFormsArray('add', '2024-08-30', 'contribution', type, subtype);
        });
      }
    });
  }

  appendDataToForms() {
    this.transactions.forEach((element: any) => {
      (this.form.get('forms') as FormArray).push({
        formKey: 'update',
        id: element.id,
        user_id: element.user_id,
        transaction_type: element.transaction_type,
        type: element.type,
        sub_type: element.sub_type,
        amount: element.amount,
        payday: element.payday
      });
    });
  }

  addToFormsArray(
    formKey: string, 
    payday: string, 
    transaction_type?: string, 
    type?: string, 
    sub_type?: string, 
    id?: number, 
    user_id?: string, 
    amount?: number
  ) {
    const formsArray = this.form.get('forms') as FormArray;

    formsArray.push(this.fb.group({
      'formKey': [formKey],
      'id': [id],
      'user_id': [user_id],
      'transaction_type': [transaction_type, inArrayValidator(['deduction', 'addition', 'contribution'])],
      'type': [type, [Validators.required, Validators.maxLength(30)]],
      'sub_type': [sub_type, [Validators.maxLength(30)]],
      'amount': [amount, [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      'payday': [payday, [dateValidator()]]
      })
    );
  }

  invalidInputLabel(controlName: string) {
    const control = this.form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  updateInvalidInput(event: Event, index: string, controlName: string) {
    const control = ((this.form.get('forms') as FormArray).get(index) as FormGroup).get(controlName);

    if(control) {
      const errors = control.errors;
      console.log(errors)
      let text = '';
      if (errors) {
        if (errors['maxlength']) {
          control.setValue(((event.target as HTMLInputElement).value).substring(0, errors['maxlength'].requiredLength));
          text += 'Max ' + errors['maxlength'].requiredLength + ' characters reached! ';
        } if (errors['pattern']) {
          if(errors['pattern'].requiredPattern == '^\\d+(\\.\\d{1,2})?$') {
            text = 'Should be integer or decimal with up to 2 places!'
            control.setValue('');
          }
        }
      }

      if(text) { this.pop.toastWithTimer('error', text); }
    }
  }

  submit(){
    console.log(this.form)
  }
}
