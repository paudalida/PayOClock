import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { PopupService } from '../../../../../services/popup/popup.service';
import { DataService } from '../../../../../services/data/data.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-leave-form',
  templateUrl: './request-form.component.html',
  styleUrl: './request-form.component.scss'
})
export class RequestFormComponent implements OnInit {
  form: FormGroup;
  isLoading: boolean = false;
  formType: string = '';

  employee: any;
  files: any;
  selectedFiles: any[] = [];
  types: any = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RequestFormComponent>, 
    private pop: PopupService,
    private ds: DataService,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {
    this.formType = data;

    /* Initialize types array */
    if(this.formType == 'leave') {
      this.types = [ 'Paid Leave', 'Sick Leave', 'Vacation leave', 'Maternal leave', 'Bereavement leave' ];
    } else if(this.formType == 'overtime') {
      this.types = [ 'Overtime 1', 'Overtime 2', 'Overtime 3' ];
    }

    this.form = this.fb.group({
      type:   ['', Validators.required],
      start:  ['', Validators.required],
      end:    ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const userData = {
    };
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    let length = files.length;
    this.selectedFiles = [];
    this.files = [];

    if(length > 5) {
      length = 5;
      this.pop.toastWithTimer('error', 'Maximum of 5 images reached');
    }

    for (let i = 0; i < length; i++) {
      const file = files[i];
      const reader = new FileReader();

      this.files.push(file);

      reader.onload = (e: any) => {
        this.selectedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          preview: e.target.result  
        });
      };

      reader.readAsDataURL(file);  
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.files.splice(index, 1);
  }

  async submit() {
    if (this.files.length === 0) {
      this.pop.toastWithTimer('error', 'No files selected for upload.');
      return;
    }

    const isConfirmed = await this.pop.swalWithCancel(
      'warning',
      'UPLOAD files?',
      'Are you sure you want to ADD these file(s)?',
      'Yes', 
      'No'   
    );

    if (isConfirmed) {
      const formData = new FormData();
      const formValues = this.form.value;

      formData.append('request_type', this.formType);

      for (const key in formValues) {
        if (formValues.hasOwnProperty(key)) {
          formData.append(key, formValues[key]);
        }
      }

      for (let i = 0; i < this.files.length; i++) {
        formData.append('attachments[]', this.files[i]);
      }
    
      this.ds.request('POST', 'employee/time-requests/store', formData).subscribe({
        next: (res: any) => {
          this.pop.toastWithTimer('success', res.message);
          this.dialogRef.close(res.data);
        },
        error: (err: any) => {
          this.pop.swalBasic('error', 'Error uploading images', err.error.message);
        },
      });
    } else {
      this.pop.toastWithTimer('error', 'Upload canceled.');
      this.dialogRef.close();
    }
  }

  close(): void {
    this.form.reset();
    this.dialogRef.close();
  }
}