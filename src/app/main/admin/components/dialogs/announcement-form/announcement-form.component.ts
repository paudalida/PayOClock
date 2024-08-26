import { Component, Inject, OnInit } from '@angular/core';
import { DataService } from '../../../../../services/data/data.service';
import { FormBuilder, FormGroup, Validators, ɵNgNoValidate } from '@angular/forms';
import { PopupService } from '../../../../../services/popup/popup.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { capitalizeFirstLetters } from '../../../../../utils/helpers';

@Component({
  selector: 'app-announcement-form',
  templateUrl: './announcement-form.component.html',
  styleUrl: './announcement-form.component.scss'
})
export class AnnouncementFormComponent implements OnInit {

  constructor(
    private ds: DataService,
    private pop: PopupService,
    private fb: FormBuilder,
    public ref: MatDialogRef<AnnouncementFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  selectedFile: any;
  isLoading = false; submissionLoading = false;
  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    content: ['', [Validators.required, Validators.maxLength(2048)]]
  })
  endpoint = 'add';

  ngOnInit(): void {
    if(this.data.details) {
      this.form.patchValue({
        title: this.data.details.title,
        content: this.data.details.content
      });

      this.endpoint = 'update/' + this.data.details.id;
    }
  }

  onFileChange(event: any, imageInput: HTMLInputElement) {
    const fileInput = event.target;
    
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
  
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        this.pop.toastWithTimer('error', 'Invalid file type. Only JPG, JPEG, and PNG files are accepted.');
        this.selectedFile = '';
        imageInput.value = '';
        return;
      }
  
      if (file.size > 2 * 1024 * 1024) {
        this.pop.toastWithTimer('error', 'File size exceeds the maximum limit of 2MB.');
        this.selectedFile = '';
        imageInput.value = '';
        return;
      }
  
      this.selectedFile = file;
    }
  }

  async submit() {
    let action = await this.pop.swalWithCancel(
      'question', 
      this.data.button + ' announcement?',
      'Are you sure you want to ' + this.data.button + ' this announcement?',
      'YES', 'NO'
    );

    if(action) {
      let formData = new FormData();
      this.submissionLoading = true;

      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control) { formData.append(key, control.value); }
      });

      if(this.selectedFile) { formData.append('image', this.selectedFile); }

      let method = 'POST';
      if(this.data.button == 'UPDATE') { method = 'PUT'; }

      this.ds.request(method, 'admin/announcements/' + this.endpoint, formData).subscribe({
        next: (res: any) => {
          this.pop.toastWithTimer('success', res.message, 5);
          this.ref.close({method: method, data: res.data});
        },
        error: (err: any) => { this.pop.swalBasic('error', 'Submission Error', err.error.message); },
        complete: () => { this.submissionLoading = false; },
      });
    }
  }

  async close() {
    let action = 'adding';
    if(this.data.button == 'UPDATE') action = 'updating';

    let res = await this.pop.swalWithCancel(
      'warning', 
      'Cancel ' + action + ' announcement?', 
      'Are you sure you want to cancel ' + action + ' announcement? Changes would not be saved!',
      'YES', 'NO'
    );
    if(res) { this.pop.toastWithTimer('error', 'Changes not saved'); this.ref.close(); }
  }

  capitalize(event: Event, control: string) {
    this.form.get(control)?.setValue(capitalizeFirstLetters((event.target as HTMLInputElement).value));
  }

}
