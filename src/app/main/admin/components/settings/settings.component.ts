import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Validators, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from '../../../../services/admin/admin.service';
import { DataService } from '../../../../services/data/data.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { dateValidator } from '../../../../utils/custom-validators';
import { ProfileComponent } from './profile/profile.component';
import { Router } from '@angular/router';

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
    deduction: this.fb.array([]),
    other_deduction: this.fb.array([]),
    allowance: this.fb.array([])
  });

  ngOnInit(): void {
    this.getHolidays();
    this.getConfig();
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

