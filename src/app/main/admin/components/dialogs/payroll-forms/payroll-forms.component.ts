import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { inArrayValidator, dateValidator } from '../../../../../utils/custom-validators';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';

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

  form: any;
  transactions: any;
  employee: any;
  hourlyRate: number = 0; netPay: number = 0; totalDeductions: number = 0;
  isLoading = false; changedValues = false;
  savedValue: any;

  ngOnInit(): void {
    this.form = this.fb.group({
      deduction: this.fb.array([]),
      other_deduction: this.fb.array([]),
      allowance: this.fb.array([]),
      delete: this.fb.array([])
    });

    this.employee = this.as.getEmployee();

    if(!this.employee.id) { this.router.navigate(['/admin/payrolls']); } // return to payrolls if employee data is not set (browser refreshed)
    this.initializePeriodicalTransactions();
    this.hourlyRate = this.employee.hourly_rate;

    this.ds.request('GET', 'admin/transactions/latest/user/' + this.employee.id).subscribe({
      next: (res: any) => { 
        res.data.forEach((element: any) => {
          let transaction_type = element.transaction_type.replace(' ', '_');
          let index = 0;

          if(transaction_type == 'deduction') {
            switch(element.type) {
              case 'SSS':
                if(element.sub_type == 'EE Share') index = 0;
                else if(element.sub_type == 'ER Share') index = 1;
                break;

              case 'PHIC':
                if(element.sub_type == 'EE Share') index = 2;
                else if(element.sub_type == 'ER Share') index = 3;
                break;

              case 'HDMF':
                if(element.sub_type == 'EE Share') index = 4;
                else if(element.sub_type == 'ER Share') index = 5;
                else if(element.sub_type == 'Salary') index = 6;
                else if(element.sub_type == 'Calamity') index = 7;
                break;
            }
            this.updateFormsArray(element.id, transaction_type, index, element.type, element.sub_type, element.amount, element.payday);
            this.savedValue = this.form.value;
          } else {
            this.addToFormsArray(transaction_type, 'update', element.type, element.sub_type, element.id, element.amount, element.payday);
          }
        });
      },
      error: () => { this.pop.toastWithTimer('error', 'Error fetching employee transactions'); }
    });
    
    // check for changes with timer for totals
    this.form.valueChanges.pipe(
      debounceTime(2000)
    ).subscribe((value: any) => {
      this.totalDeductions = 0; this.netPay = 0;
      if(this.savedValue != value) { this.changedValues = true; } 
      else this.changedValues = false;

      this.formsArray('deduction').value.forEach((element: any) => {
        if(element.amount)
        this.totalDeductions += parseInt(element.amount as string);
      });

      this.formsArray('other_deduction').value.forEach((element: any) => {
        if(element.amount)
        this.totalDeductions += parseInt(element.amount as string);
      });

      this.netPay += this.hourlyRate * 8 * 15;
      this.formsArray('allowance').value.forEach((element: any) => {
        if(element.amount)
        this.netPay += parseInt(element.amount as string);
      });
    });
  }

  formsArray(type: string) {
      return this.form.get(type) as FormArray;
  }

  initializePeriodicalTransactions() {
    ['SSS', 'PHIC', 'HDMF'].forEach(type => {
      ['EE Share', 'ER Share'].forEach(subtype => {        
        this.addToFormsArray('deduction', 'add', type, subtype);
      });

      if(type == 'HDMF') {
        ['Salary', 'Calamity'].forEach(subtype => {
          this.addToFormsArray('deduction', 'add', type, subtype);
        });
      }
    });
  }

  addToFormsArray(
    formType: string,
    formKey: string, 
    type?: string, 
    sub_type?: string, 
    id?: number, 
    amount?: number,
    payday: string = '2024-08-31'
  ) {
    const formArray = this.formsArray(formType);
    formArray.push(this.fb.group({
      'formKey': [formKey],
      'id': [id],
      'user_id': [this.employee.id],
      'type': [type, [Validators.required, Validators.maxLength(30)]],
      'sub_type': [sub_type, [Validators.maxLength(30)]],
      'amount': [amount, [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      'payday': [payday, [dateValidator()]]
      })
    );

    if(formType == 'deduction') {
      formArray.at(formArray.length - 1).get('type')?.disable();
    }
  }

  updateFormsArray(
    id: number, 
    formType: string,
    index: number,
    type?: string, 
    sub_type?: string, 
    amount?: number,
    payday: string = '2024-08-30'
  ) {
    this.formsArray(formType).get(String(index))?.patchValue({
      'id': id,
      'formKey': 'update',
      'type': type,
      'sub_type': sub_type,
      'amount': amount,
      'payday': payday
    });
  }

  async removeFromFormsArray(type: string, index: number) {
    const idField = this.formsArray(type).get(String(index))?.get('id');

    if(idField?.value) {
      const confirm = await this.pop.swalWithCancel('warning', 
        'Remove this record?', 
        'This record contain values saved prior to this session. This action cannot be undone, are you sure you want to continue?',
        'Yes! Delete it!',
        'No. I still need it.',
        false
      );
      
      if(confirm){
        this.formsArray('delete').push(this.fb.group({
          id: idField.value,
          type: 'delete'
        }));

        this.formsArray(type).removeAt(index);
      }
    } else {
      this.formsArray(type).removeAt(index);
    }

  }

  invalidInputLabel(controlName: string) {
    const control = this.form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  updateInvalidInput(event: Event, type: string, index: string, controlName: string) {
    const control = (this.formsArray(type).get(index) as FormGroup).get(controlName);

    if(control) {
      const errors = control.errors;
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

  async submit() {
    this.pop.swalWithCancel('question', 'Confirm Submission?', 'Are you sure you want to save these records?')
      .then(isConfirmed => {
        if (isConfirmed) this.submitToServer();
      });
  }

  submitToServer(){
    this.isLoading = true;
    const formArray = this.formsArray('deduction');
    // for(let i = 4; i <= 8; i++) {
    //   formArray.get(''+i)?.patchValue({
    //     amount: 100
    //   })
    // }

    for(let i = 0; i < formArray.length; i++) {
      formArray.at(i).get('type')?.enable();
    }

    if(this.form.valid) {
      this.ds.request('POST', 'admin/transactions/process', { form: this.form.value }).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.pop.toastWithTimer('success', res.message, 5);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.pop.swalBasic('error', 'Submission error!', err.error.message);
        },
        complete: () => {
          for(let i = 0; i < formArray.length; i++) {
            formArray.at(i).get('type')?.enable();
          }
        }
      });
    }
  }

  async backRoute() {
    this.pop.swalWithCancel('question', 'Leave this page?', 'Changes you have made may not be saved.')
      .then(isConfirmed => {
        if (isConfirmed) this.router.navigate(['admin/payrolls']);
      });
  }
}
