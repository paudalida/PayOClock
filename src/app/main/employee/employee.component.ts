import { Component, OnInit } from "@angular/core";
import { DataService } from "../../services/data/data.service";
import { PopupService } from "../../services/popup/popup.service";
import { AuthService } from "../../services/auth/auth.service";


@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.scss'
})
export class EmployeeComponent implements OnInit {
  
  constructor (
    private ds: DataService,
    private auth: AuthService,
    private pop: PopupService
  ) { }

  isLoading = true;
  currentDateTime: string = '';

  ngOnInit(): void {
    // this.ds.request('GET', 'admin/employees').subscribe({
    //   next: (res: any) => {
    //     this.as.setEmployees(res.data);
    //   },
    //   error: () => {
    //     this.pop.swalBasic(
    //       'error',
    //       'Oops! Cannot fetch data!',
    //       'We are working on it. You can help us speed up the process by sending us an error report.'
    //     );
    //   },
    //   complete: () => {
    //     this.isLoading = false;
    //   }
    // });    

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