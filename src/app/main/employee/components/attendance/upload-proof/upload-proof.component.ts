import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupService } from '../../../../../services/popup/popup.service';
import { DataService } from '../../../../../services/data/data.service';

interface FilePreview {
  name: string;
  type: string;
  url: string;
}

@Component({
  selector: 'app-upload-proof',
  templateUrl: './upload-proof.component.html',
  styleUrls: ['./upload-proof.component.scss']
})
export class UploadProofComponent implements OnInit {
  files: FilePreview[] = [];
  originalFiles: any = []; 
  data: any;

  constructor(
    private dialogRef: MatDialogRef<UploadProofComponent>, 
    private router: Router,
    private pop: PopupService,
    private ds: DataService
  ) {}

  selectedFile: any = null;
  isLoading = false;

  ngOnInit(): void {}

  closePopup(data: any = null) {
    this.dialogRef.close(data); 
  }

  onFileChange(event: any) {
    const fileInput = event.target.files;
    const maxFiles = 5;
  
    this.files = [];
    this.originalFiles = [];
  
    const dataTransfer = new DataTransfer();
    for (let i = 0; i < Math.min(fileInput.length, maxFiles); i++) {
      dataTransfer.items.add(fileInput[i]);
    }
  
    event.target.files = dataTransfer.files;
  
    if (fileInput.length > maxFiles) {
      this.pop.toastWithTimer('error', 'Maximum of 5 images reached');
    }
  
    for (let i = 0; i < Math.min(fileInput.length, maxFiles); i++) {
      const file = fileInput[i];
  
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        this.pop.toastWithTimer('error', 'Invalid file type. Only JPG, JPEG, and PNG files are accepted.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.pop.toastWithTimer('error', 'File size exceeds the maximum limit of 5MB.');
        return;
      }
  
      this.originalFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.files.push({
          name: file.name,
          type: file.type,
          url: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadFiles() {
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
    
      // Append each file to the FormData object
      for (let i = 0; i < this.files.length; i++) {
        formData.append('images[]', this.originalFiles[i]);
      }
    
      // Send the FormData object instead of a plain JSON object
      this.ds.request('POST', 'employee/attendance/proof', formData).subscribe({
        next: (res: any) => {
          this.pop.toastWithTimer('success', res.message);
          this.closePopup(res.data);
        },
        error: (err: any) => {
          this.pop.swalBasic('error', 'Error uploading images', err.error.message);
        }
      });
    } else {
      this.pop.toastWithTimer('error', 'Upload canceled.');
      this.dialogRef.close();
    }
  }
  
  // Remove file from preview  
  removeFile(index: number): void {
    this.originalFiles.splice(index, 1);
    this.files.splice(index, 1);
  }
}
