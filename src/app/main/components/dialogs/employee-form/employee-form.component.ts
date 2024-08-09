import { Component } from '@angular/core';
import { DataService } from '../../../../services/data/data.service';
import { FormBuilder, Validators } from '@angular/forms';
import { PopupService } from '../../../../services/popup/popup.service';
import { inArrayValidator, startsWithValidator } from '../../../../utils/custom-validators';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss'
})
export class EmployeeFormComponent {

  constructor (
    private ds: DataService,
    private pop: PopupService,
    private fb: FormBuilder
  ) { }

  form = this.fb.group({
    'id': [''],
    'type': ['', [Validators.required, inArrayValidator(['admin', 'employee'])]],
    'employee_id': ['', [Validators.required, ]],
    'first_name': ['', [Validators.required, Validators.maxLength(30)]],
    'middle_name': ['', Validators.maxLength(20)],
    'last_name': ['', [Validators.required, Validators.maxLength(20)]],
    'ext_name': ['', Validators.maxLength(10)],
    'sex': ['0', ['', [Validators.required, inArrayValidator([0, 1, 2])]]],
    'position': ['', [Validators.required, Validators.maxLength(20)]],
    'phone_number': ['09', [Validators.maxLength(11), startsWithValidator('09')]]
  });

  submit() {
    this.ds.request('POST', 'admin/employees/add', this.form.value).subscribe({
      next: (res: any) => {
        this.pop.toastWithTimer('success', res.message);
      }, error: (err: any) => {
        this.pop.swalBasic('error', 'Submission Error', err.error.message);
      }
    })
  }
}
