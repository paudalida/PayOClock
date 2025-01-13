import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from '../../../../services/employee/employee.service';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopupService } from '../../../../services/popup/popup.service';
import { DataService } from '../../../../services/data/data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private es: EmployeeService,
    private fb: FormBuilder,
    private pop: PopupService,
    private ds: DataService
  ) {}

  
  activeTable = -1; 
  hasActive = false; 
  items: any = [1]; 
  employee: any;

  selectedFile: any = null;
  contact: FormGroup = this.fb.group({
    phone_number: ['', [ Validators.required ]],
    email:        ['', [ Validators.required ]],
    province:     ['', [ Validators.required, Validators.maxLength(40) ] ],
    city:         ['', [ Validators.required, Validators.maxLength(40) ]],
    barangay:     ['', [ Validators.required, Validators.maxLength(40) ] ],
    street:       ['', [ Validators.required, Validators.maxLength(40) ]],
    house_number: ['', [ Validators.required, Validators.maxLength(40) ]],
    zip_code:     ['', [ Validators.required, Validators.maxLength(10) ] ]
  });

  ngOnInit(): void {
    this.employee = this.es.getEmployee();

    if(this.employee.contact) {
      let ctemp = this.employee.contact;
      this.contact.setValue({
        phone_number: ctemp.phone_number,
        email:        ctemp.email,
        province:     ctemp.province,
        city:         ctemp.city,
        barangay:     ctemp.barangay,
        street:       ctemp.street,
        house_number: ctemp.house_number,
        zip_code:     ctemp.zip_code
      });
    }
  }
  
  clickTable(index: number) {
    
    if (this.activeTable === index) {
      this.hasActive = !this.hasActive;
    } else {
      
      this.activeTable = index;
      this.hasActive = true;  
    }
  }
  
  openDialog() {
    if (this.dialog) {
      this.dialog.open(ChangePasswordComponent);
    } else {
      console.error('Dialog is not initialized');
    }
  }

  onFileChange(event: any) {
    const fileInput = event.target;

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];

        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            this.pop.toastWithTimer('error', 'Invalid file type. Only JPG, JPEG, and PNG files are accepted.');
            // Clear the input element
            fileInput.value = '';
            this.selectedFile = null; // Use null instead of '' for clarity
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            this.pop.toastWithTimer('error', 'File size exceeds the maximum limit of 2MB.');
            // Clear the input element
            fileInput.value = '';
            this.selectedFile = null; // Use null instead of '' for clarity
            return;
        }

        this.selectedFile = file;
    }
  }


  updateContact() {
    
    if(this.contact.valid) {

      let data = this.contact.value;

      /* Append image file if exists */
      if(this.selectedFile) {
        const formData = new FormData();
  
        Object.keys(this.contact.controls).forEach(key => {
          const controlValue = this.contact.get(key)?.value;
          
          formData.append(key, controlValue);
        });

        formData.append('image', this.selectedFile);
        data = formData;
      }

      this.ds.request('POST', 'employee/contact/update', data).subscribe({
        next: (res: any) => {
          this.pop.toastWithTimer('success', res.message);
          this.es.setContact(res.data.contact);

          if(res.data.image) this.es.setImage(res.data.image);

          this.employee = this.es.getEmployee();
        },
        error: (err: any) => {
          this.pop.swalBasic('error', 'Oops! An error has occured', err.error.message);
        }
      })
    }
  }
}
