import { Component, OnInit } from "@angular/core";
import { DataService } from "../../services/data/data.service";
import { AdminService } from "../../services/admin/admin.service";
import { PopupService } from "../../services/popup/popup.service";
import { AuthService } from "../../services/auth/auth.service";
import { EmployeeService } from "../../services/employee/employee.service";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  
  constructor (
    private ds: DataService,
    private as: AdminService,
    private auth: AuthService,
    private es: EmployeeService,
    private pop: PopupService
  ) { }

  isLoading = true;
  currentDateTime: string = '';

  ngOnInit(): void {
    console.log(this.es.getEmployee())
    this.ds.request('GET', 'admin/employees').subscribe({
      next: (res: any) => {
        res.data.forEach((element: any) => {
          element.full_name = element.first_name + ' ';
          if(element.middle_name) element.full_name += element.middle_name[0].toUpperCase() + '. ';
          element.full_name += element.last_name;
          if(element.ext_name) element.full_name += ' ' + element.ext_name;
        });
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

    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  updateDateTime(): void {
    const now = new Date();
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    };
  
    const datePart = now.toLocaleDateString('en-US', dateOptions);
    const timePart = now.toLocaleTimeString('en-US', timeOptions);
  
    this.currentDateTime = `${datePart}, ${timePart}`;
  }

  async logout() {
    let res = await this.pop.swalWithCancel(
      'question', 
      'Are you sure you want to log out?'
    );
    if(res) { this.auth.logout(); }    
  }
}