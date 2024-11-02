import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-overtime-form',
  templateUrl: './overtime-form.component.html',
  styleUrl: './overtime-form.component.scss'
})
export class OvertimeFormComponent implements OnInit {
  form: FormGroup;
  isLoading: boolean = false;
  
  data = {
    title: 'Overtime Request Form',
    formType: 'add'
  };

  employee: any;
  selectedFiles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OvertimeFormComponent>, 
  ) {
    this.form = this.fb.group({
      type: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
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
    this.selectedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

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

  removeFile(file: any): void {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
  }

  // submit(): void {
  //   if (this.form.valid) {
  //     this.isLoading = true;
  //     const formData = this.form.value;
  //     console.log('Form Data:', formData);

  //     setTimeout(() => {
  //       this.isLoading = false;
  //       alert('Leave request submitted successfully!');
  //       this.form.reset();
  //     }, 2000);
  //   } else {
  //     this.form.markAllAsTouched();
  //   }
  // }

  close(): void {
    this.form.reset();
    this.dialogRef.close();
  }
}