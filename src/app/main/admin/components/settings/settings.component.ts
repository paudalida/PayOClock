import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Validators, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from '../../../../services/admin/admin.service';
import { DataService } from '../../../../services/data/data.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { dateValidator, duplicateTypeSubtypeValidator } from '../../../../utils/custom-validators';
import { ProfileComponent } from './profile/profile.component';
import { Router } from '@angular/router';
import { getMatFormFieldMissingControlError } from '@angular/material/form-field';
import { format } from 'path';
import { config } from 'process';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

  constructor(
    private router: Router,
    private ds: DataService,
    private pop: PopupService,
    private fb: FormBuilder
  ){}
  
  holidayForm = this.fb.group({
    regular: this.fb.array([]),
    special_non_working: this.fb.array([])
  });

  configForm = this.fb.group({
    deduction: this.fb.array([], duplicateTypeSubtypeValidator),
    other_deduction: this.fb.array([], duplicateTypeSubtypeValidator),
    allowance: this.fb.array([], duplicateTypeSubtypeValidator)
  });

  ngOnInit(): void {
    this.getHolidays();
    this.getConfig();
  }

  duplicateInput(category: string, index: number) {
    const formArray = this.formsArray('config', category);
    
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
  
  showErrors(category: string, index: number, type: string) {
    const formArrayErrors = this.formsArray('config', category)?.errors;
    const formField = this.formsArray('config', category)?.get(String(index))?.get(type);
    const formErrors = formField?.errors;

    if(formArrayErrors) {
      this.pop.toastWithTimer('error', 'Duplicate records detected');
    }

    if(formErrors) {
      if(formErrors['pattern'] && formErrors['pattern']['requiredPattern'] === '^\\d+(\\.\\d{1,2})?$') {
        this.pop.toastWithTimer('error', 'Should be a number up to 2 decimal places');
        formField.setValue(formField.value.slice(0, -1))
      } else if(formErrors['maxlength']) {
        const maxlength = formErrors['maxlength']['requiredLength'];

        this.pop.toastWithTimer('error', 'Should not exceed ' + String(maxlength) + ' number of characters');
        formField.setValue(formField.value.slice(0, maxlength));
      }
    }
  }

  getHolidays() {
    this.ds.request('GET', 'view/holidays').subscribe({
      next: (res: any) => {
        res.data.forEach((element: any) => {
          this.addToHolidayForm(element.type, element.is_recurring, element.name, element.date, 'update', element.id);
        });
      },
      error: (err: any) => {
        this.pop.swalBasic('error', this.pop.genericErrorTitle, err.error.message);
      }
    })
  }

  getConfig() {
    this.ds.request('GET', 'admin/periodic-transactions/config').subscribe({
      next: (res: any) => {
        res.data.forEach((element: any) => {
          this.addToConfigForm(
            element.category,
            'update',
            element.operation_type,
            element.type,
            element.subtype,
            element.amount,
            element.id
          );
        });
      }
    })
  }

  formsArray(formType: string, category: string) {
    let form = null;
    switch(formType) {
      case 'holiday':
        form = this.holidayForm as FormGroup;
        break;

      case 'config':
        form = this.configForm as FormGroup;
        break;

      default:
        return;
    }
    return form.get(category) as FormArray;
  }

  addToConfigForm(
    category: string,
    formKey: string, 
    operation_type: string,
    type?: string, 
    subtype?: string, 
    amount?: number,
    id?: number
  ) {
    this.formsArray('config', category)?.push(this.fb.group({
      formKey: [formKey],
      operation_type: [operation_type, [Validators.required, Validators.maxLength(20)]],
      type: [type, [Validators.required, Validators.maxLength(30)]],
      subtype: [subtype, [Validators.maxLength(30)]],
      amount: [amount, [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      id: [id]
    }));    
  }

  addToHolidayForm(
    category: string,
    is_recurring: number,
    name: string = '',
    date: string = '',
    formKey: string = 'add',
    id?: number
  ) {
    this.formsArray('holiday', category)?.push(this.fb.group({
      formKey: [formKey],
      type: [category, [Validators.required, Validators.maxLength(20)]],
      is_recurring: [is_recurring, [Validators.required]],
      name: [name, [Validators.required, Validators.maxLength(50)]],
      date: [date, [Validators.required, dateValidator()]],
      id: [id]
    }));    
  }

  async removeFromFormsArray(formType: string, category: string, index: number) {
    const idField = this.formsArray(formType, category)?.get(String(index))?.get('id');

    if(idField?.value) {
      const confirm = await this.pop.swalWithCancel('warning', 
        'Remove this record?', 
        'This record contain values saved prior to this session. This action cannot be undone, are you sure you want to continue?',
        'Yes! Delete it!',
        'No. I still need it.',
        false
      );
      
      if(confirm){
        this.formsArray(formType, category)?.removeAt(index);
      }
    } else {
      this.formsArray(formType, category)?.removeAt(index);
    }
  }

  submit(formType: string) {

    let form = null;
    let url = '';

    switch(formType) {
      case 'holiday':
        url = 'admin/holidays/process';
        form = this.holidayForm as FormGroup;
        break;

      case 'config':
        url = 'admin/periodic-transactions/process/config';
        form = this.configForm as FormGroup;
        break;
    }

    if(form?.valid) {
      this.ds.request('POST', url, { form: form.value }).subscribe({
        next: (res: any) => {
          this.pop.toastWithTimer('success', res.message);
        },
        error: (err: any) => {
          this.pop.swalBasic('error', this.pop.genericErrorTitle, err.error.message);
        }
      })
    } else {
      this.pop.swalBasic('error', 'Invalid Form', 'Oops! It looks like you are sending an invalid form. Please fix inputs first');
    }
  }

  redirectToProfile() {
    this.router.navigate(['/admin/settings/profile']);
  }

  redirectToActivity() {
    this.router.navigate(['/admin/settings/activity']);
  }
}

