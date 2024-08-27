import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { DataService } from '../../../../services/data/data.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { AdminService } from '../../../../services/admin/admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements AfterViewInit {

  constructor(
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService
  ) { }

  isLoading = true;

  ngAfterViewInit(): void {
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
