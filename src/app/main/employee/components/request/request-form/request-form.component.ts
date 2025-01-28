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
  form: any;
  isLoading: boolean = false;
  formType: string = '';

  employee: any;
  files: any;
  selectedFiles: any[] = [];
  allTypes: any = {
    paid: ['Sick Leave', 'Vacation Leave', 'Maternal Leave', 'Bereavement Leave'],
    unpaid: ['Personal Leave', 'Study Leave', 'Unpaid Sick Leave']
  };
  types: any = [];
  leaveTypes: any = ['Paid Leave', 'Unpaid Leave'];


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
      this.types = [ 'Sick Leave', 'Vacation leave', 'Maternal leave', 'Bereavement leave' ];
    } else if(this.formType == 'overtime') {
      this.types = [ 'Overtime' ];
    }
  }

  ngOnInit(): void {
    this.loadUserData();
  
    if (this.formType === 'overtime') {
      // this.form.get('reason')?.setValidators(Validators.required);
      // this.form.get('files')?.setValidators(Validators.required);
      this.form = this.fb.group({
        request_type: ['overtime', Validators.required],
        type:   ['overtime', Validators.required],
        start:  ['', Validators.required],
        end:    ['', Validators.required],
        reason: ['', Validators.required], 
        files: [''] 
      });
    } else {
      
      this.form = this.fb.group({
        request_type: ['', Validators.required],
        type:   ['', Validators.required],
        start:  ['', Validators.required],
        end:    ['', Validators.required],
        reason: [''], 
        files: [''] 
      });
      this.setupLeaveTypeWatcher();

    }
  
    this.updateFormValidators();
  }

  updateFormValidators(): void {
    // Update validations based on the formType
    this.form.get('reason')?.updateValueAndValidity();
    this.form.get('files')?.updateValueAndValidity();
  }

  loadUserData(): void {
    const userData = {
    };
  }

  setupLeaveTypeWatcher(): void {
    // Watch for changes in leaveType and adjust validations and types dynamically
    this.form.get('leaveType')?.valueChanges.subscribe((selectedLeaveType: string) => {
      // Update validation based on selected leave type
      if (selectedLeaveType === 'Paid Leave') {
        this.form.get('files')?.setValidators(Validators.required);
        this.form.get('reason')?.clearValidators();
        this.types = this.allTypes.paid;
      } else if (selectedLeaveType === 'Unpaid Leave') {
        this.form.get('reason')?.setValidators(Validators.required); 
        this.form.get('files')?.clearValidators();       
        this.types = this.allTypes.unpaid;
      } else {
        // Clear all validations if leaveType is not selected
        this.form.get('files')?.clearValidators();
        this.form.get('reason')?.clearValidators();
        this.types = [];
      }
  
      // Update validation states
      this.form.get('files')?.updateValueAndValidity();
      this.form.get('reason')?.updateValueAndValidity();
  
      // Reset dependent fields (type dropdown)
      this.form.get('type')?.setValue('');
    });
  }
  
  validateStartTime(event: any): void {
    const selectedTime = new Date(event.target.value);
    let valid = false;
  
    if (this.formType === 'leave') {
      // For Leave, time must be between 08:00 AM and 05:00 PM
      valid = selectedTime.getHours() >= 8 && selectedTime.getHours() <= 17;
    } else if (this.formType === 'overtime') {
      // For Overtime, time must be 05:00 PM onwards
      valid = selectedTime.getHours() >= 17;
    }

    if (!valid) {
      // Reset the value and show toast notification with specific message
      this.form.get('start')?.setValue('');
      if (this.formType === 'leave') {
        this.pop.toastWithTimer('error', 'Start time must be between 08:00 AM and 05:00 PM.');
      } else if (this.formType === 'overtime') {
        this.pop.toastWithTimer('error', 'Start time must be from 05:00 PM onwards for overtime.');
      }
    }
  }

  // Validate the end time
  validateEndTime(event: any): void {
    const selectedTime = new Date(event.target.value);
    const startTime = new Date(this.form.get('start')?.value);
    let valid = false;
  
    if (this.formType === 'leave') {
      // For Leave, time must be between 08:00 AM and 05:00 PM
      valid = selectedTime.getHours() >= 8 && selectedTime.getHours() <= 17 && selectedTime >= startTime;
    } else if (this.formType === 'overtime') {
      // For Overtime, time must be 05:00 PM onwards
      valid = selectedTime.getHours() >= 17 && selectedTime >= startTime;
    }
  
    if (!valid) {
      // Reset the value and show toast notification with specific message
      this.form.get('end')?.setValue('');
      if (this.formType === 'leave') {
        this.pop.toastWithTimer('error', 'End time must be between 08:00 AM and 05:00 PM.');
      } else if (this.formType === 'overtime') {
        this.pop.toastWithTimer('error', 'End time must be from 05:00 PM onwards for overtime.');
      }
    }
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
    this.form.get('files')?.setValue(this.files);
  }

  async submit() {
    // Initialize files if not already defined
    if (!this.files) {
      this.files = [];
    }
  
    // If it's an overtime form and there's no reason provided, we show an error message
    if (this.formType === 'overtime' && !this.form.get('reason')?.value) {
      this.pop.toastWithTimer('error', 'Reason is required for overtime request.');
      return;
    }
  
    // If it's a leave form and no files are selected and leave type is "Paid Leave"
    if (this.formType === 'leave' && this.form.get('leaveType')?.value === 'Paid Leave' && this.files.length === 0) {
      this.pop.toastWithTimer('error', 'No files selected for upload.');
      return;
    }
  
    let isConfirmed: boolean;
  
    // Confirmation logic based on form type
    if (this.formType === 'overtime') {
      // Overtime confirmation - no file upload
      isConfirmed = await this.pop.swalWithCancel(
        'warning',
        'Submit Overtime Request?',
        'Are you sure you want to submit your overtime request with the provided reason?',
        'Yes',
        'No'
      );
    } else {
      // Leave confirmation - only ask for file upload for Paid Leave
      if (this.form.get('leaveType')?.value === 'Paid Leave') {
        isConfirmed = await this.pop.swalWithCancel(
          'warning',
          'UPLOAD files?',
          'Are you sure you want to ADD these file(s) and submit the leave request?',
          'Yes',
          'No'
        );
      } else {
        // For Unpaid Leave, no file upload confirmation
        isConfirmed = await this.pop.swalWithCancel(
          'warning',
          'Submit Leave Request?',
          'Are you sure you want to submit the leave request without attaching files?',
          'Yes',
          'No'
        );
      }
    }
  
    if (isConfirmed) {
      const formData = new FormData();
      const formValues = this.form.value;
  
      formData.append('request_type', this.formType);
  
      // Append form values to FormData
      for (const key in formValues) {
        if (formValues.hasOwnProperty(key)) {
          formData.append(key, formValues[key]);
        }
      }
  
      // Only append the files if it's a "Paid Leave" form
      if (this.formType === 'leave' && this.form.get('leaveType')?.value === 'Paid Leave') {
        for (let i = 0; i < this.files.length; i++) {
          formData.append('attachments[]', this.files[i]);
        }
      }
  
      // Send the request
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
      this.pop.toastWithTimer('error', 'Request canceled.');
      this.dialogRef.close();
    }
  } 

  close(): void {
    this.form.reset();
    this.dialogRef.close();
  }
}