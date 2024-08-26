import { Component } from '@angular/core';
import { DataService } from '../../../../../services/data/data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopupService } from '../../../../../services/popup/popup.service';

@Component({
  selector: 'app-add-announcement',
  templateUrl: './add-announcement.component.html',
  styleUrl: './add-announcement.component.scss'
})
export class AddAnnouncementComponent {

  constructor(
    private ds: DataService,
    private pop: PopupService,
    private fb: FormBuilder
  ) { }

  selectedFile: any;
  form: FormGroup = this.fb.group({
    id: [''],
    title: ['', [Validators.required, Validators.maxLength(255)]],
    content: ['', [Validators.required, Validators.maxLength(2048)]]
  })

  onFileChange(event: any) {
    const fileInput = event.target;
    
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
  
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        this.pop.toastWithTimer('error', 'Invalid file type. Only JPG, JPEG, and PNG files are accepted.');
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

  submit() {
    console.log(this.form)
  }

}
