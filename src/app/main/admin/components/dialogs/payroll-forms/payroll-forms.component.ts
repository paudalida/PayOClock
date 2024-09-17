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
  basePay = 0;
  data: any = null;

  ngOnInit(): void {
    this.isLoading = true;

    this.form = this.fb.group({
      base_pay: this.fb.array([
        this.fb.group({
          formKey: [''],
          operation_type: ['base_pay', [Validators.required, Validators.maxLength(20)]],
          id: [''],
          user_id: [''],
          category: ['base_pay'],
          type: ['base pay'],
          sub_type: [, [Validators.maxLength(30)]],
          amount: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
          payday: ['', [dateValidator()]]
        })
      ]),
      deduction: this.fb.array([]),
      other_deduction: this.fb.array([]),
      allowance: this.fb.array([])
    });

    this.employee = this.as.getEmployee();

    if(!this.employee.id) { this.router.navigate(['/admin/payrolls']); } // return to payrolls if employee data is not set (browser refreshed)
    // this.initializePeriodicalTransactions();
    this.hourlyRate = this.employee.hourly_rate;

    this.ds.request('GET', 'admin/transactions/latest/user/' + this.employee.id).subscribe({
      next: (res: any) => { 
        this.data = res.data;

        if(this.data.length) { this.updateData(); this.isLoading = false; }
        else {
          this.ds.request('GET', 'admin/periodic-transactions/user/' + this.employee.id).subscribe({
            next: (res1: any) => { this.data = res1.data; this.updateData(); this.isLoading = false; },
            error: (err1: any) => { this.pop.toastWithTimer('error', err1.error.message); },
            complete: () => { this.isLoading = false; }
          });
        }
        
      },
      error: (err: any) => { this.pop.toastWithTimer('error', err.error.message); }
    });

    // check for changes with timer for totals
    this.form.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe((value: any) => {
      this.totalDeductions = 0; this.netPay = 0;
      if(this.savedValue != value) { this.changedValues = true; } 
      else this.changedValues = false;

      this.formsArray('deduction').value.forEach((element: any) => {
        if(element.amount) {
          if(element.operation_type == 'deduction') {
            this.totalDeductions += parseInt(element.amount as string);
          } else if(element.operation_type == 'percentage deduction') {
            this.totalDeductions += (parseInt(element.amount as string) * (parseInt(this.formsArray('base_pay').at(0).get('amount')?.value as string) / 100));
          }
        }
      });

      this.formsArray('other_deduction').value.forEach((element: any) => {
        if(element.amount)
        this.totalDeductions += parseInt(element.amount as string);
      });

      this.formsArray('allowance').value.forEach((element: any) => {
        if(element.amount)
        this.netPay += parseInt(element.amount as string);
      });
      
      this.netPay += this.basePay;
      this.netPay -= this.totalDeductions;
    });
  }

  updateData() {
    this.data.forEach((element: any) => {
      let index = 0;

      // if(element.category == 'deduction') {
      //   this.updateFormsArray(element.id, element.category, index, element.type, element.sub_type, element.amount, element.payday);
      //   this.savedValue = this.form.value;
      // } else {
      if(element.category == 'base_pay'){
        this.form.get('base_pay').at(0).patchValue({
          formKey: 'update',
          operation_type: element.operation_type,
          id: element.id,
          user_id: this.employee.id,
          type: element.type,
          sub_type: element.sub_type,
          amount: element.amount,
          payday: element.payday
        });

        this.basePay = element.amount;
      }

      if(element.category == 'deduction' || element.category == 'allowance' || element.category == 'other_deduction')
        this.addToFormsArray(element.category, 'update', element.operation_type, element.type, element.sub_type, element.id, element.amount, element.payday);
      // }
    });
  }

  changeBasePay(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;
  
    // Allow only numbers and a single period
    const validInput = inputValue.match(/^\d*\.?\d*$/);
  
    // if (!validInput) {
    //   inputValue = inputValue.slice(0, -1);
    //   inputElement.value = inputValue;
    // }
    
    this.form.get('base_pay').at(0).patchValue({
      amount: inputValue
    });
  }

  formsArray(type: string) {
      return this.form.get(type) as FormArray;
  }

  addToFormsArray(
    formType: string,
    formKey: string, 
    operation_type: string,
    type?: string, 
    sub_type?: string, 
    id?: number, 
    amount?: number,
    payday: string = '2024-09-15',
  ) {
    const formArray = this.formsArray(formType);
    formArray.push(this.fb.group({
      formKey: [formKey],
      operation_type: [operation_type, [Validators.required, Validators.maxLength(20)]],
      id: [id],
      user_id: [this.employee.id],
      type: [type, [Validators.required, Validators.maxLength(30)]],
      sub_type: [sub_type, [Validators.maxLength(30)]],
      amount: [amount, [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      payday: [payday, [dateValidator()]]
    }));    
  }

  updateFormsArray(
    id: number, 
    formType: string,
    index: number,
    type?: string, 
    sub_type?: string, 
    amount?: number,
    payday: string = '2024-08-30',
    operation_type?: string,
  ) {
    this.formsArray(formType).get(String(index))?.patchValue({
      id: id,
      formKey: 'update',
      type: type,
      sub_type: sub_type,
      amount: amount,
      payday: payday,
      operation_type: operation_type
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
        this.formsArray(type).removeAt(index);
      }
    }

  }

  /* Error catching */
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

  /* Submissions */
  async submit() {
    this.pop.swalWithCancel('question', 'Confirm Submission?', 'Are you sure you want to save these records?')
      .then(isConfirmed => {
        if (isConfirmed) this.submitToServer();
      });
  }

  submitToServer(){
    this.isLoading = true;
    console.log(this.formsArray('base_pay').at(0).get('amount')?.errors);
    console.log(this.formsArray('base_pay'))

    if(this.form.valid) {
      this.ds.request('POST', 'admin/transactions/process/user/' + this.employee.id, { form: this.form.value }).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.pop.toastWithTimer('success', res.message, 5);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.pop.swalBasic('error', 'Submission error!', err.error.message);
        }
      });
    } else {
      this.pop.swalBasic('error', 'Invalid Form', 'Oops! It looks like you are sending an invalid form. Please fix inputs first');
    }
    this.isLoading = false;
  }

  async backRoute() {
    this.pop.swalWithCancel('question', 'Leave this page?', 'Changes you have made may not be saved.')
      .then(isConfirmed => {
        if (isConfirmed) this.router.navigate(['admin/payslips']);
      });
  }
}
