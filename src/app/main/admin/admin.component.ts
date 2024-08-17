import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { AdminService } from '../../services/admin/admin.service';
import { decryptData, encryptData } from '../../utils/encryption';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit{

  constructor(private ds: DataService, private as: AdminService) { }

  isLoading = true;

  async ngOnInit() {
    this.ds.request('GET', 'admin/employees').subscribe({
      next: (res: any) => {
        this.as.setEmployees(res.data);
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
      }
    });
  }
}