import { Component, OnInit } from "@angular/core";
import { DataService } from "../../services/data/data.service";
import { AdminService } from "../../services/admin/admin.service";
import { PopupService } from "../../services/popup/popup.service";
import { AuthService } from "../../services/auth/auth.service";
import { EmployeeService } from "../../services/employee/employee.service";
import { NotificationService } from "../../services/notification/notification.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  constructor (
    private ds: DataService,
    private as: AdminService,
    private auth: AuthService,
    private notif: NotificationService,
    private pop: PopupService,
    private router: Router, 
    private es: EmployeeService
  ) { }

  isLoading = true;
  currentDateTime: string = '';
  notificationCount: number = 0;
  showNotifications: boolean = false;  
  notifications: Array<{ message: string, time: string }> = []; 

  employee: any;
  showProfileDropdown: boolean = false;

  ngOnInit(): void {
    this.employee = this.es.getEmployee();
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

    this.ds.request('GET', 'view/dashboard/config').subscribe({
      next: (res: any) => {
        this.es.setConfig(res.data);
      }
    })

    this.getNotifications();
    setInterval(() => {
      this.getNotifications();
    }, 60 * 1000);

    setInterval(() => {
      this.countNotifications();
    }, 1000);
  }
  
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  navigateToProfile(): void {
    this.router.navigate(['/admin/settings/profile']);
  }

  getNotifications() {
    this.ds.request('GET', 'admin/notifications').subscribe({
      next: (res: any) => {
        this.notifications = res.data;
        this.notif.setNotifications(this.notifications);
        this.notificationCount = this.notif.getNotificationsCount;
      }
    })
  }

  countNotifications() {
    this.notificationCount = this.notif.getNotificationsCount;
  }

  redirectToRequests() {
    this.router.navigate(['/admin/request']);
  }

  async logout() {
    let res = await this.pop.swalWithCancel(
      'question',
      'Are you sure you want to log out?'
    );
    if (res) { this.auth.logout(); }
  }
}
