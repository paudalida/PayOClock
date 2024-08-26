import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { AdminService } from '../../services/admin/admin.service';
import { PopupService } from '../../services/popup/popup.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {

  constructor(
    private ds: DataService, 
    private as: AdminService, 
    private pop: PopupService,
    private route: ActivatedRoute
  ) { }

  isLoading = true;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.ds.request('GET', 'admin/employees').subscribe({
      next: (res: any) => {
        this.as.setEmployees(res.data);
      },
      error: () => {
        this.pop.swalBasic(
          'error', 
          'Oops! Cannot fetch data!', 
          'We are working on it. You can help us speed up the process by sending us an error report.'
        );
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}