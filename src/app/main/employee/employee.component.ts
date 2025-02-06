import { Component, OnInit, HostListener } from "@angular/core";
import { DataService } from "../../services/data/data.service";
import { PopupService } from "../../services/popup/popup.service";
import { AuthService } from "../../services/auth/auth.service";
import { EmployeeService } from "../../services/employee/employee.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {

  constructor (
    private ds: DataService,
    private auth: AuthService,
    private pop: PopupService, 
    private router: Router,
    private es: EmployeeService
  ) { }

  isLoading = true;
  currentDateTime: string = '';

  employee: any;
  showProfileDropdown: boolean = false;
  
  isSidebarVisible: boolean = true; // to control sidebar visibility
  isToolbarVisible: boolean = false; // to control toolbar visibility
  
  ngOnInit(): void {
    this.employee = this.es.getEmployee();
    // this.updateDateTime();
    // setInterval(() => {
    //   this.updateDateTime();
    // }, 1000);

    // Initially check window size to set visibility
    this.checkWindowSize();

    this.ds.request('GET', 'view/dashboard/config').subscribe({
      next: (res: any) => {
        this.es.setConfig(res.data);
      }
    })
  }

  // Listen to window resize and update visibility
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize();
  }

  checkWindowSize() {
    if (window.innerWidth > 500) {
      this.isSidebarVisible = true;
      this.isToolbarVisible = false;
    } else {
      this.isSidebarVisible = false;
      this.isToolbarVisible = true;
    }
  }

  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  navigateToProfile(): void {
    this.router.navigate(['/employee/profile']);
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
