import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { inArrayValidator, isPhoneNumber } from '../../../../../utils/custom-validators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '../../../../../services/data/data.service';
import { PopupService } from '../../../../../services/popup/popup.service';
import { capitalizeFirstLetters } from '../../../../../utils/helpers';
import { AdminService } from '../../../../../services/admin/admin.service';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss'
})
export class EmployeeFormComponent {

  form: FormGroup = this.fb.group({
    'id': [''],
    'type': ['employee', [Validators.required, inArrayValidator(['admin', 'employee'])]],
    'employee_id': ['', [Validators.required, Validators.maxLength(30)]],
    'first_name': ['', [Validators.required, Validators.maxLength(30)]],
    'middle_name': ['', [Validators.maxLength(20)]],
    'last_name': ['', [Validators.required, Validators.maxLength(20)]],
    'ext_name': ['', [Validators.maxLength(10)]],
    'gender': ['0', [Validators.required, inArrayValidator(['0', '1', '2'])]],
    'position': ['', [Validators.required, Validators.maxLength(20)]],
    'phone_number': ['09', [Validators.maxLength(11), isPhoneNumber()]]
  });

  constructor (
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    if(data.formType == 'update') {
      let employee = this.as.getEmployee();
      this.form.patchValue({
        'id': employee.id,
        'type': employee.type,
        'employee_id': employee.employee_id,
        'first_name': employee.first_name,
        'middle_name': employee.middle_name || '',
        'last_name': employee.last_name,
        'ext_name': employee.ext_name || '', 
        'gender': String(employee.gender), 
        'position': employee.position, 
        'phone_number': employee.phone_number, 
      });
    }
  }

  selectedFile: any = null;

  /* Validators */
  invalidInputLabel(controlName: string) {
    const control = this.form.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  updateInvalidInput(event: Event, controlName: string) {
    const control = this.form.get(controlName);
    console.log(this.form.valid)

    if(controlName.includes('name') || controlName == 'position') { control?.setValue(capitalizeFirstLetters(control.value)) }

    if(control) {
      const errors = control.errors;
      console.log(errors)
      let text = '';
      if (errors) {
        if (errors['maxlength']) {
          control.setValue(((event.target as HTMLInputElement).value).substring(0, errors['maxlength'].requiredLength));
          text += 'Max ' + errors['maxlength'].requiredLength + ' characters reached! ';
        } if (errors['requiredFormat']) {
          text += 'Should be a phone number starting with 09';
          control.setValue('09');
        }
      }

      if(text) { this.pop.toastWithTimer('error', text); }
    }
  }

  onFileChange(event: any) {
    const fileInput = event.target;
    
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
  
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        this.pop.toastWithTimer('error', 'Invalid file type. Only JPEG files are accepted.');
        this.selectedFile = '';
        return;
      }
  
      if (file.size > 2 * 1024 * 1024) {
        this.pop.toastWithTimer('error', 'File size exceeds the maximum limit of 2MB.');
        this.selectedFile = '';
        return;
      }
  
      this.selectedFile = file;
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

      let formData = new FormData();

      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control) { formData.append(key, control.value); }
      });

      if(this.selectedFile) { formData.append('image', this.selectedFile); }

      if(this.data.formType == 'update') { method = 'PUT'; }
      this.ds.request(method, 'admin/employees/' + this.data.formType, formData).subscribe({
        next: (res: any) => {
          this.pop.toastWithTimer('success', res.message, 5);
          this.dialogRef.close({method: method, data: res.data})
        }, error: (err: any) => {
          this.pop.swalBasic('error', 'Submission Error', err.error.message);
        }
      });
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
