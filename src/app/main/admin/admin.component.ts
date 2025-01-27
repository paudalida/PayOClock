import { Component, OnInit } from "@angular/core";
import { DataService } from "../../services/data/data.service";
import { AdminService } from "../../services/admin/admin.service";
import { PopupService } from "../../services/popup/popup.service";
import { AuthService } from "../../services/auth/auth.service";
import { EmployeeService } from "../../services/employee/employee.service";
import { NotificationService } from "../../services/notification/notification.service";

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
    private pop: PopupService
  ) { }

  isLoading = true;
  currentDateTime: string = '';
  notificationCount: number = 0;
  showNotifications: boolean = false;  
  notifications: Array<{ message: string, time: string }> = []; 

  ngOnInit(): void {
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

    this.updateDateTime();
    setInterval(() => {
      this.updateDateTime();
    }, 1000);

    this.getNotifications();
    setInterval(() => {
      this.getNotifications();
    }, 60 * 1000);

    setInterval(() => {
      this.countNotifications();
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
      hour12: true
    };

    const datePart = now.toLocaleDateString('en-US', dateOptions);
    const timePart = now.toLocaleTimeString('en-US', timeOptions);

    this.currentDateTime = `${datePart}, ${timePart}`;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
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

  async logout() {
    let res = await this.pop.swalWithCancel(
      'question',
      'Are you sure you want to log out?'
    );
    if (res) { this.auth.logout(); }
  }
}
