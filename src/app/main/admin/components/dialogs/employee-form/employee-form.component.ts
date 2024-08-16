import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { inArrayValidator, startsWithValidator } from '../../../../../utils/custom-validators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss'
})
export class EmployeeFormComponent {

  form: FormGroup = this.fb.group({
    'id': [''],
    'type': ['employee', [Validators.required, inArrayValidator(['admin', 'employee'])]],
    'employee_id': ['', [Validators.required]],
    'first_name': ['', [Validators.required, Validators.maxLength(30)]],
    'middle_name': ['', [Validators.maxLength(20)]],
    'last_name': ['', [Validators.required, Validators.maxLength(20)]],
    'ext_name': ['', [Validators.maxLength(10)]],
    'sex': [0, [Validators.required, inArrayValidator([0, 1, 2])]],
    'position': ['', [Validators.required, Validators.maxLength(20)]],
    'phone_number': ['09', [Validators.maxLength(11), startsWithValidator('09')]]
  });

  constructor (
    private ds: DataService,
    private pop: PopupService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    if(data.formType == 'update') {
      this.form.patchValue({
        'id': data.details.id,
        'type': data.details.type,
        'employee_id': data.details.employee_id,
        'first_name': data.details.first_name,
        'middle_name': data.details.middle_name || '',
        'last_name': data.details.last_name,
        'ext_name': data.details.ext_name || '', 
        'sex': data.details.sex, 
        'position': data.details.position, 
        'phone_number': data.details.phone_number, 
      });
    }
  }

  async submit() {
    let action = await this.pop.swalWithCancel(
      'question', 
      this.data.formType.toUpperCase() + ' employee?',
      'Are you sure you want to ' + this.data.formType.toUpperCase() + ' this employee?',
      'YES', 'NO'
    );

    if(action) {
      let method = 'POST';
      if(this.data.formType == 'update') { method = 'PUT'; }
      this.ds.request(method, 'admin/employees/' + this.data.formType, this.form.value).subscribe({
        next: (res: any) => {
          this.pop.toastWithTimer('success', res.message, 5);
          this.dialogRef.close({method: method, data: res.data.employee})
        }, error: (err: any) => {
          this.pop.swalBasic('error', 'Submission Error', err.error.message);
        }
      })
    }
  }

  async close() {
    let action = 'adding';
    if(this.data.formType == 'update') action = 'updating';

    let res = await this.pop.swalWithCancel(
      'warning', 
      'Cancel ' + action + ' employee?', 
      'Are you sure you want to cancel ' + action + ' employee? Changes would not be saved!',
      'YES', 'NO'
    );
    if(res) { this.pop.toastWithTimer('error', 'Changes not saved'); this.dialogRef.close(); }
  }
}
