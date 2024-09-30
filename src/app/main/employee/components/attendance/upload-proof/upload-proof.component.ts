import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupService } from '../../../../../services/popup/popup.service';

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
  data: any;

  constructor(
    private dialogRef: MatDialogRef<UploadProofComponent>, 
    private router: Router,
    private pop: PopupService,
  ) {}

  selectedFile: any = null;
  isLoading = false;

  ngOnInit(): void {}

  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/employee/attendance']);
  }


  onFileChange(event: any) {
    const fileInput = event.target.files;

    this.files = [];

    for (let i = 0; i < fileInput.length; i++) {
      const file = fileInput[i];

      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        this.pop.toastWithTimer('error', 'Invalid file type. Only JPG, JPEG, and PNG files are accepted.');
        return;
      }

      if (file.size > 50 * 1024 * 1024) { 
        this.pop.toastWithTimer('error', 'File size exceeds the maximum limit of 50MB.');
        return;
      }

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
      this.pop.toastWithTimer('success', 'File/files uploaded!'); 
      this.dialogRef.close();
      this.isLoading = false;
    } else {
      this.pop.toastWithTimer('error', 'Upload canceled.');
      this.dialogRef.close();
      this.isLoading = false;
    }
  }
  
  // Remove file from preview
  removeFile(index: number) {
    this.files.splice(index, 1);
  }
}
