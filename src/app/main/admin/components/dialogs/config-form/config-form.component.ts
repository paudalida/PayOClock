import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DataService } from '../../../../../services/data/data.service';
import { FormBuilder } from '@angular/forms';
import { PopupService } from '../../../../../services/popup/popup.service';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-config-form',
  templateUrl: './config-form.component.html',
  styleUrl: './config-form.component.scss'
})
export class ConfigFormComponent implements OnInit, OnDestroy{

  constructor(
    private ds: DataService,
    private fb: FormBuilder,
    private pop: PopupService,
    private as: AdminService,
    public dialogRef: MatDialogRef<ConfigFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }


  form = this.fb.group({
    deduction: this.fb.array([]),
    other_deduction: this.fb.array([]),
    allowance: this.fb.array([])
  });

  ngOnInit(): void {
    this.ds.request('GET', 'admin/periodic-transactions/user/' + this.as.getEmployee().id).subscribe({
      next: (res: any) => {
        this.data = res.data;
        res.data.forEach((element: any) => {
          this.addToFormsArray(
            element.category,
            'update',
            element.operation_type,
            element.type,
            element.sub_type,
            element.amount,
            element.id
          );
        });
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops! A problem has been encountered!', err.error.message);
      }
    })
  }

  ngOnDestroy(): void {
    this.close();
  }

  close() {
    this.dialogRef.close(this.data);
  }

  formsArray(category: string) {
    return this.form.get(category) as FormArray;
  }

  addToFormsArray(
    category: string,
    formKey: string, 
    operation_type: string,
    type?: string, 
    sub_type?: string, 
    amount?: number,
    id?: number
  ) {

    const formArray = this.form.get(category) as FormArray;

    formArray.push(this.fb.group({
      formKey: [formKey],
      operation_type: [operation_type, [Validators.required, Validators.maxLength(20)]],
      type: [type, [Validators.required, Validators.maxLength(30)]],
      sub_type: [sub_type, [Validators.maxLength(30)]],
      amount: [amount, [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      id: [id]
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
      
      if(confirm){
        this.formsArray(type).removeAt(index);
      }
    }
  }

  submit() {
    if(this.form.valid) {
      this.ds.request('POST', 'admin/periodic-transactions/process/user/' + this.as.getEmployee().id, { form: this.form.value }).subscribe({
        next: (res: any) => {
          this.data = res.data;
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
}
