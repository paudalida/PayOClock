import { Component } from '@angular/core';
import { Validators, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from '../../../../services/data/data.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { dateValidator } from '../../../../utils/custom-validators';
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
    SSS: this.fb.group({
      ER: this.fb.array([]),
      EE: this.fb.array([])
    }),
    PHIC: this.fb.group({
      ER: this.fb.group({
        id: [''],
        formKey: ['update'],
        operation_type: ['percentage deduction'],
        type: 'PHIC ER Share',
        amount: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]]
      }),
      EE: this.fb.group({
        id: [''],
        formKey: ['update'],
        operation_type: ['percentage deduction'],
        type: 'PHIC EE Share',
        amount: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]]
      })
    }),
    HDMF:  this.fb.group({
      ER: this.fb.group({
        id: [''],
        formKey: ['update'],
        operation_type: ['deduction'],
        type: 'HDMF ER Share',
        amount: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]]
      }),
      EE: this.fb.group({
        id: [''],
        formKey: ['update'],
        operation_type: ['deduction'],
        type: 'HDMF EE Share',
        amount: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]]
      })
    }),
  });

  expandedTable = true;
  ngOnInit(): void {
    this.getHolidays();
    this.getConfig();

    this.configFormsArray('SSS', 'ER').valueChanges.subscribe((changes) => {
      this.syncEEValues();
    });
  }

  syncEEValues(): void {
    this.configFormsArray('SSS', 'ER').controls.forEach((erForm, i) => {
      const eeForm = this.configFormsArray('SSS', 'EE').at(i);
      eeForm?.get('min_pay_range')?.patchValue(erForm.get('min_pay_range')?.value);
      eeForm?.get('max_pay_range')?.patchValue(erForm.get('max_pay_range')?.value);
    });
  }

  rangePattern() {
    let pattern: any = {
      range: 0,
      er: 0,
      ee: 0
    };

    const sssForm = this.configForm.get('SSS') as FormGroup;
    pattern.range = Number(sssForm.get('ER')?.get('1')?.get('max_pay_range')?.value) - Number(sssForm.get('ER')?.get('0')?.get('max_pay_range')?.value);
    pattern.er = Number(sssForm.get('ER')?.get('1')?.get('amount')?.value) - Number(sssForm.get('ER')?.get('0')?.get('amount')?.value);
    pattern.ee = Number(sssForm.get('EE')?.get('1')?.get('amount')?.value) - Number(sssForm.get('EE')?.get('0')?.get('amount')?.value);

    for(let i = 2; i < (sssForm.get('ER') as FormArray).length; i++) {
      let max_pay_range = (Number(sssForm.get('ER')?.get((i - 1).toString())?.get('max_pay_range')?.value) + pattern.range).toFixed(2);
      if(i == (sssForm.get('ER') as FormArray).length - 1) {
        max_pay_range = '';
      }

      if(i == 20) {
        sssForm.get('ER')?.get(i.toString())?.patchValue({
          min_pay_range: (Number(sssForm.get('ER')?.get((i - 1).toString())?.get('min_pay_range')?.value) + pattern.range).toFixed(2),
          max_pay_range: max_pay_range
        });
      } else {
        sssForm.get('ER')?.get(i.toString())?.patchValue({
          min_pay_range: (Number(sssForm.get('ER')?.get((i - 1).toString())?.get('min_pay_range')?.value) + pattern.range).toFixed(2),
          max_pay_range: max_pay_range,
          amount: Number(sssForm.get('ER')?.get((i - 1).toString())?.get('amount')?.value) + pattern.er
        });
      }

      sssForm.get('EE')?.get(i.toString())?.patchValue({
        min_pay_range: (Number(sssForm.get('EE')?.get((i - 1).toString())?.get('min_pay_range')?.value) + pattern.range).toFixed(2),
        max_pay_range: max_pay_range,
        amount: Number(sssForm.get('EE')?.get((i - 1).toString())?.get('amount')?.value) + pattern.ee
      })
    }

    sssForm.updateValueAndValidity();
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
        Object.entries(res.data).forEach(([key, values]: [string, any]) => {
          let category = '';
          if(key.includes('ER')) category = 'ER';
          else if(key.includes('EE')) category = 'EE';
          
          if(key.includes('SSS')) {
            values.forEach((element: any) => {
              this.addToConfigForm(
                category,
                'update',
                element.operation_type,
                element.type,
                element.amount,
                element.min_pay_range,
                element.max_pay_range,
                element.id
              );
            });
          } else if(key.includes('PHIC')) {
            this.configForm.get('PHIC')?.get(category)?.patchValue({
              id: values[0].id,
              amount: values[0].amount
            });
          } else if(key.includes('HDMF')) {
            this.configForm.get('HDMF')?.get(category)?.patchValue({
              id: values[0].id,
              amount: values[0].amount
            });
          }
        });
      }
    })
  }

  formsArray(formType: string, category: string, cat2?: string) {
    let form = null;
    switch(formType) {
      case 'holiday':
        form = this.holidayForm as FormGroup;
        break;

      default:
        return;
    }
    return form.get(category) as FormArray;
  }

  clickTable() {
    this.expandedTable = !this.expandedTable;
  }
  
  configFormsArray(type: string, category: string) {
    return this.configForm.get(type)?.get(category) as FormArray;
  }

  addToConfigForm(
    category: string,
    formKey: string, 
    operation_type: string = 'deduction',
    type?: string,
    amount?: number,
    min_pay_range?: number,
    max_pay_range?: number,
    id?: number
  ) {
    const isOver2 = this.configFormsArray('SSS', category).length >= 2;
    const is20 = this.configFormsArray('SSS', category).length == 20;
    const isER = category == 'ER';
    
    this.configFormsArray('SSS', category).push(this.fb.group({
      formKey: [formKey],
      operation_type: [operation_type, [Validators.required, Validators.maxLength(20)]],
      type: [type, [Validators.required, Validators.maxLength(30)]],
      min_pay_range: [{value: min_pay_range ?? '', disabled: isOver2}, [Validators.required]],
      max_pay_range: [{value: max_pay_range ?? '', disabled: isOver2}, [Validators.required]],
      amount: [{value: amount ?? '', disabled: (isOver2 && !isER) || !is20}, [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      id: [id]
    }));

    this.rangePattern();
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
      this.ds.request('POST', url, { form: form.getRawValue() }).subscribe({
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

