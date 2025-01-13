import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PopupService } from '../../../../../services/popup/popup.service';
import { DataService } from '../../../../../services/data/data.service';
import { AdminService } from '../../../../../services/admin/admin.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrl: './import.component.scss'
})
export class ImportComponent {

  constructor(
    private dialogRef: MatDialogRef<ImportComponent>, 
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService
  ) { }

  isLoading = false;

  file: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0]; // Get the first selected file
  
      // Check if the file is an .xlsx file
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx')) {
        this.file = file;
      } else {
        this.file = null;
        this.pop.swalBasic('error', 'Invalid file type', 'Please select an .xlsx file.');
      }
    } else {
      this.file = null; // No file selected
    }
  }

  submit() {
    if (!this.file) {
      this.pop.swalBasic('error', 'Cannot send request!', 'No file selected');
      return;
    }
  
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', this.file);

    this.isLoading = true;
    this.ds.request('POST', 'admin/employees/import', formData).subscribe({
      next: (res: any) => {
        this.pop.toastWithTimer('success', res.message);
        this.dialogRef.close({type: 'import'});
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops! Import failed', err.error.message);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  closePopup() {
    this.dialogRef.close();
  }

}
