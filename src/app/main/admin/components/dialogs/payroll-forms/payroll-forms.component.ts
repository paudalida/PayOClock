import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { inArrayValidator, dateValidator, duplicateTypeSubtypeValidator } from '../../../../../utils/custom-validators';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfigFormComponent as Dialog } from '../config-form/config-form.component';

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
    private router: Router,
    private dialog: MatDialog
  ) { }

  form: any;
  transactions: any;
  periodicTransactions: any;
  employee: any;
  hourlyRate: number = 0; grossPay: number = 0; totalDeductions: number = 0;
  isLoading = false; changedValues = false;
  savedValue: any;
  basePay = 0;

  activeTable = -1; 
  hasActive = false; 
  items: any = [1]; 

  clickTable(index: number) {
    
    if (this.activeTable === index) {
      this.hasActive = !this.hasActive;
    } else {
      
      this.activeTable = index;
      this.hasActive = true;  
    }
  }

  ngOnInit(): void {
    this.isLoading = true;

    this.form = this.fb.group({
      details: this.fb.group({
        status: [''],
        payday_start: [''],
        payday_end: ['']
      }),
      deduction: this.fb.array([], duplicateTypeSubtypeValidator),
      other_deduction: this.fb.array([], duplicateTypeSubtypeValidator),
      allowance: this.fb.array([], duplicateTypeSubtypeValidator), 
      adjustment_deductions: this.fb.array([], duplicateTypeSubtypeValidator), 
      adjustment_additions: this.fb.array([], duplicateTypeSubtypeValidator)
    });

    this.totalsListener();

    this.employee = this.as.getEmployee();

    if(!this.employee.id) { this.router.navigate(['/admin/payslips']); } // return to payrolls if employee data is not set (browser refreshed)
    
    this.hourlyRate = this.employee.hourly_rate;

    this.getData();
  }

  getData() {
    const details = this.form.get('details');
    const date = this.as.getPayday();

    this.ds.request('GET', 'admin/transactions/' + this.as.getPayday().payday_end + '/user/' + this.employee.id).subscribe({
      next: (res: any) => { 
        if(res.data) { 
          this.savedValue = res.data;

          res.data.forEach((element: any) => {
            if(element.category == 'deduction'
              || element.category == 'allowance'
              || element.category == 'other_deduction' 
              || element.category == 'adjustment_deductions' 
              || element.category == 'adjustment_additions'){

              this.addToFormsArray(
                    element.category, 
                    'update',
                    element.operation_type, 
                    element.type, 
                    element.subtype, 
                    element.amount,
                    element.id, 
                  );
            }

            // if(!(details.get('payday_start').value && details.get('payday_end').value)) {

            //   details.patchValue({
            //     payday_start: element.payday_start,
            //     payday_end: element.payday_end
            //   });
            // }
          });
          this.isLoading = false; 
        }
        else { this.getConfig(); }

        details.patchValue({
          payday_start: date.payday_start,
          payday_end: date.payday_end
        });
      },
      error: (err: any) => { this.pop.toastWithTimer('error', err.error.message); }
    });
  }

  duplicateInput(category: string, index: number) {
    const formArray = this.formsArray(category);
    
    if (formArray) {
      const errors = formArray.errors;

      if (errors && errors['duplicateTypeSubtype']) {
        const duplicateIndices = errors['duplicateTypeSubtype'];

        if (duplicateIndices.includes(index)) {
          return true;
        }
      }
    }

    return false;
  }
  
  getConfig() {
    this.ds.request('GET', 'admin/periodic-transactions/user/' + this.employee.id).subscribe({
      next: (res: any) => { 
        this.periodicTransactions = res.data;

        res.data.forEach((element: any) => {
          if(element.category == 'deduction'
             || element.category == 'allowance'
             || element.category == 'other_deduction' 
            ){

            this.addToFormsArray(
                  element.category, 
                  'add',
                  element.operation_type, 
                  element.type, 
                  element.subtype, 
                  element.amount,
                  element.id, 
                );
          }
        });
        this.isLoading = false; 
      },
      error: (err1: any) => { this.pop.toastWithTimer('error', err1.error.message); },
      complete: () => { this.isLoading = false; }
    });
  }

  totalsListener() {
    this.form.valueChanges.subscribe((value: any) => {
      this.totalDeductions = 0; this.grossPay = 0;
      if(this.savedValue != value) { this.changedValues = true; } 
      else this.changedValues = false;

      this.formsArray('deduction').value.forEach((element: any) => {
        if(element.amount) {
          if(element.operation_type == 'deduction') {
            this.totalDeductions += parseInt(element.amount as string);
          } else if(element.operation_type == 'percentage deduction') {
            // this.totalDeductions += (parseInt(element.amount as string) * (parseInt(this.formsArray('base_pay').at(0).get('amount')?.value as string) / 100));
          }
        }
      });

      this.formsArray('other_deduction').value.forEach((element: any) => {
        if(element.amount) {
          this.totalDeductions += parseInt(element.amount as string);
        }
      });

      this.formsArray('allowance').value.forEach((element: any) => {
        if(element.amount)
        this.grossPay += parseInt(element.amount as string);
      });
    });
  }

  formsArray(type: string) {
      return this.form.get(type) as FormArray;
  }

  addToFormsArray(
    category: string,
    formKey: string, 
    operation_type: string,
    type?: string, 
    subtype?: string, 
    amount?: number,
    id?: number
  ) {
    const formArray = this.formsArray(category);
    formArray.push(this.fb.group({
      formKey: [formKey],
      operation_type: [operation_type, [Validators.required, Validators.maxLength(20)]],
      id: [id],
      user_id: [this.employee.id],
      type: [type, [Validators.required, Validators.maxLength(30)]],
      subtype: [subtype, [Validators.maxLength(30)]],
      amount: [amount, [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
    }));    
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
      
      if (confirm) {
        this.formsArray(type).removeAt(index);
      }
    } else {
      this.formsArray(type).removeAt(index);
    }
  }

  async resetClick(type: string) {
    switch(type) {
      case 'default':
        const reset1 = await this.pop.swalWithCancel(
          'question', 
          'Reset to defaults?',
          'Are you sure you want to reset the forms to default values set in configuration? This action can\'t be undone!',
          'Yes, reset to default',
          'No, I take it back'
        );
    
        if(!reset1) return;
        if(!this.periodicTransactions) this.getConfig();
        this.resetToDefaults();
        break;

      case 'saved':
        const reset2 = await this.pop.swalWithCancel(
          'question', 
          'Reset to last saved?',
          'Are you sure you want to reset the forms to last saved data? This action can\'t be undone!',
          'Yes, reset values',
          'No, I take it back'
        );
  
        if(!reset2) return;
        if(!this.savedValue) this.resetToDefaults()
        this.resetToSaved();
        break;
    }
  }

  resetToDefaults() {
    this.formsArray('deduction').clear();
    this.formsArray('other_deduction').clear();
    this.formsArray('allowance').clear();
    this.formsArray('adjustment_deductions').clear();
    this.formsArray('adjustment_additions').clear();

    if(this.periodicTransactions) {
      this.periodicTransactions.forEach((element: any) => {
        
        if(element.category == 'deduction'
          || element.category == 'allowance'
          || element.category == 'other_deduction'
        ){
            
          this.addToFormsArray(
                element.category, 
                'add',
                element.operation_type, 
                element.type, 
                element.subtype, 
                element.amount,
                element.id, 
              );
        }
      });
    }
  }

  resetToSaved() {
    this.formsArray('deduction').clear();
    this.formsArray('other_deduction').clear();
    this.formsArray('allowance').clear();
    this.formsArray('adjustment_deductions').clear();
    this.formsArray('adjustment_additions').clear();

    if(this.savedValue) {
      this.savedValue.forEach((element: any) => {
        
        if(element.category == 'deduction'
          || element.category == 'allowance'
          || element.category == 'other_deduction' 
          || element.category == 'adjustment_deductions' 
          || element.category == 'adjustment_additions'
        ){

          this.addToFormsArray(
                element.category, 
                'update',
                element.operation_type, 
                element.type, 
                element.subtype, 
                element.amount,
                element.id, 
              );
        }
      });
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
  async submit(status: number) {
    this.pop.swalWithCancel('question', 'Confirm Submission?', 'Are you sure you want to save these records?')
      .then(isConfirmed => {
        if (isConfirmed) this.submitToServer(status);
      });
  }

  submitToServer(status: number){
    this.isLoading = true;
    this.form.get('details').patchValue({
      status: status
    });

    if(this.form.valid) {
      this.ds.request('POST', 'admin/transactions/process/user/' + this.employee.id, { form: this.form.value }).subscribe({
        next: (res: any) => {
          this.savedValue = res.data;
          this.pop.toastWithTimer('success', res.message);

          let employees = this.as.getEmployees();
          let employee = employees.find((x: any) => x.id == this.as.getEmployee().id);

          if (employee) {
            switch(status) {
              case 1:
                employee.status = 'Incomplete';
                break;
                
              case 2:
                employee.status = 'Complete';
                break;

              default:
                employee.status = 'Pending';
                break;
            }
          }

          this.as.setEmployees(employees);
        },
        error: (err: any) => {
          this.pop.swalBasic('error', 'Submission error!', err.error.message);
        },
        complete: () => { this.isLoading = false; }
      });
    } else {
      this.pop.swalBasic('error', 'Invalid Form', 'Oops! It looks like you are sending an invalid form. Please fix inputs first');
    }
    this.isLoading = false;
  }

  openDialog() {
    if (this.dialog) {
      const dialogRef = this.dialog.open(Dialog, { data: this.periodicTransactions });

      dialogRef.afterClosed().subscribe((res: any) => {
        this.periodicTransactions = res;
        if(!this.savedValue) { this.resetToDefaults(); }
      });
    }
  }

  async backRoute() {
    this.pop.swalWithCancel('question', 'Leave this page?', 'Changes you have made may not be saved.')
      .then(isConfirmed => {
        if (isConfirmed) this.router.navigate(['admin/payslips']);
      });
  }
}
