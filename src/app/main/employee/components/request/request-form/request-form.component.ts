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
  inputValue = '';
  allTypes: any = {
    paid: ['Sick Leave', 'Vacation Leave', 'Maternal Leave', 'Bereavement Leave', 'Other'],
    unpaid: ['Personal Leave', 'Study Leave', 'Unpaid Sick Leave', 'Other']
  };
  types: any = [];
  leaveTypes: any = ['Paid Leave', 'Unpaid Leave'];

  leaveCredits = 0;
  otherType = '';


  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RequestFormComponent>, 
    private pop: PopupService,
    private ds: DataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.formType = data.type;
    this.leaveCredits = data.leaveCredits;

    /* Initialize types array */
    if(this.formType == 'leave') {
      this.types = [ 'Sick Leave', 'Vacation leave', 'Maternal leave', 'Bereavement leave', 'Other'];
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
        end:    [{value: '', disabled: this.form?.get('start')?.value === ''}, Validators.required],
        reason: ['', Validators.required], 
        files: [''] 
      });
    } else {
      
      this.form = this.fb.group({
        request_type: ['', Validators.required],
        type:   ['', Validators.required],
        otherType: [''],
        start:  ['', Validators.required],
        end:    ['', Validators.required],
        reason: [''], 
        files: [''] 
      });
      this.setupLeaveTypeWatcher();
    }
  
    this.updateFormValidators();
  }

  get isPaidLeaveSelected(): boolean {
    return this.form.get('request_type')?.value === 'Paid Leave';
  }

  getLeaveCredits() {
    return `${Math.floor(this.leaveCredits / 8)} days and ${this.leaveCredits % 8} hours`;
  }

  updateFormValidators(): void {
    this.form.get('reason')?.updateValueAndValidity();
    this.form.get('files')?.updateValueAndValidity();
  }

  loadUserData(): void {
    const userData = {
    };
  }

  updateType() {
    if(this.formType !== 'leave') {
      if(this.inputValue !== 'Other')
      this.form.patchValue({
        type: this.inputValue
      });

      this.form.updateValueAndValidity();
    }
  }

  setupLeaveTypeWatcher(): void {
    this.form.get('leaveType')?.valueChanges.subscribe((selectedLeaveType: string) => {
      if (selectedLeaveType === 'Paid Leave') {
        this.form.get('files')?.setValidators(Validators.required);
        this.form.get('reason')?.clearValidators();
        this.types = this.allTypes.paid;
      } else if (selectedLeaveType === 'Unpaid Leave') {
        this.form.get('reason')?.setValidators(Validators.required); 
        this.form.get('files')?.clearValidators();       
        this.types = this.allTypes.unpaid;
      } else {
        this.form.get('files')?.clearValidators();
        this.form.get('reason')?.clearValidators();
        this.types = [];
      }
  
      this.form.get('files')?.updateValueAndValidity();
      this.form.get('reason')?.updateValueAndValidity();
  
      this.form.get('type')?.setValue('');
    });
  }
  
  validateStartTime(event: any): void {
    const selectedTime = new Date((event.target as HTMLInputElement).value);
    let valid = false;
  
    if (this.formType === 'leave') {
      valid = selectedTime.getHours() >= 8 && selectedTime.getHours() <= 17;
    } else if (this.formType === 'overtime') {
      valid = selectedTime.getHours() >= 17;
    }

    if (!valid) {
      this.form.get('start')?.setValue('');
      if (this.formType === 'leave') {
        this.pop.toastWithTimer('error', 'Start time must be between 08:00 AM and 05:00 PM.');
      } else if (this.formType === 'overtime') {
        this.pop.toastWithTimer('error', 'Start time must be from 05:00 PM onwards for overtime.');
      }
    }
  }

  validateEndTime(event: any): void {
    const selectedTime = new Date((event.target as HTMLInputElement).value);
    const startTime = new Date(this.form.get('start')?.value);
    let valid = false;
  
    if (this.formType === 'leave') {
      valid = selectedTime.getHours() >= 8 && selectedTime.getHours() <= 17;
    } else if (this.formType === 'overtime') {
      valid = selectedTime.getHours() >= 17 && selectedTime >= startTime;
    }
  
    if (!valid) {
      this.form.get('end')?.setValue('');
      if (this.formType === 'leave') {
        this.pop.toastWithTimer('error', 'End time must be between 08:00 AM and 05:00 PM.');
      } else if (this.formType === 'overtime') {
        this.pop.toastWithTimer('error', 'End time must be from 05:00 PM onwards for overtime.');
      }
    } else if(selectedTime < startTime) {
      this.pop.toastWithTimer('error', 'End time must be greater than start time.');
      this.form.get('end')?.setValue('');
    } else if(this.form.get('request_type')?.value === 'Paid Leave') {
      const totalHours = this.calculateHours();
      if (totalHours > this.leaveCredits) {
        this.pop.toastWithTimer('error', 'You do not have enough leave credits for this request.');
        this.form.get('end')?.setValue('');
      }
    }
  }
  
  calculateHours() {
    const start = new Date(this.form.get('start')?.value);
    const end = new Date(this.form.get('end')?.value);
    let totalHours = 0;
  
    // Helper function to calculate hours for a single day
    function calculateDailyHours(date: Date, isStart: boolean, isEnd: boolean): number {
      const day = date.getDay();
      if (day === 0 || day === 6) return 0; // Exclude weekends
  
      let hours = 0;
      const startHour = isStart ? date.getHours() : 8;
      const endHour = isEnd ? date.getHours() : 17;
  
      if (startHour < 8) date.setHours(8, 0, 0, 0); // Start at 8 AM if earlier
      if (endHour >= 17) date.setHours(17, 0, 0, 0); // No working hours after 5 PM
  
      if (startHour < 12) {
        hours += Math.min(12, endHour) - startHour;
      }
      if (endHour >= 13) {
        hours += Math.min(17, endHour) - Math.max(13, startHour);
      }
      return hours;
    }
  
    // Calculate hours for the start day
    if (start.toDateString() === end.toDateString()) {
      totalHours += calculateDailyHours(start, true, true);
    } else {
      totalHours += calculateDailyHours(start, true, false);
      totalHours += calculateDailyHours(end, false, true);
  
      // Calculate hours for the days in between
      let currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + 1);
      while (currentDate.toDateString() !== end.toDateString()) {
        totalHours += calculateDailyHours(currentDate, false, false);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  
    return totalHours;
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
    if (!this.files) {
        this.files = [];
    }
  
    if (this.formType === 'overtime' && !this.form.get('reason')?.value) {
        this.pop.toastWithTimer('error', 'Reason is required for overtime request.');
        return;
    }
  
    if (this.formType === 'leave' && this.form.get('leaveType')?.value === 'Paid Leave' && this.files.length === 0) {
        this.pop.toastWithTimer('error', 'No files selected for upload.');
        return;
    }
  
    let isConfirmed: boolean;
  
    if (this.formType === 'overtime') {
        isConfirmed = await this.pop.swalWithCancel(
            'warning',
            'Submit Overtime Request?',
            'Are you sure you want to submit your overtime request?',
            'Yes',
            'No'
        );
    } else {
      isConfirmed = await this.pop.swalWithCancel(
                      'warning',
                      'UPLOAD files?',
                      'Are you sure submit the leave request?',
                      'Yes',
                      'No'
                  );
    }
  
    if (isConfirmed) {
        const formData = new FormData();
        const formValues = this.form.value;
  
        formData.append('request_type', this.formType);
  
        // Append other form values to formData
        for (const key in formValues) {
            if (formValues.hasOwnProperty(key)) {
                formData.append(key, formValues[key]);
            }
        }
  
        // If there are files selected, append them
        if (this.formType === 'leave' && this.form.get('request_type')?.value === 'Paid Leave') {
          // If the type is 'Other', use the value from 'otherType'
          if (this.form.get('type')?.value === 'Other' && this.form.get('otherType')?.value) {
              formData.set('type', this.form.get('otherType')?.value); // Set 'otherType' as the 'type' value
          } else {
              formData.set('type', this.form.get('type')?.value); // Use selected 'type'
          }

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
    }
}

  
  close(): void {
    this.form.reset();
    this.dialogRef.close();
  }
}