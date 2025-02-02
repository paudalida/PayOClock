import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupService } from '../../../../services/popup/popup.service';
import { DataService } from '../../../../services/data/data.service';
import { UploadProofComponent } from './upload-proof/upload-proof.component';
import { ProofHistoryComponent } from './proof-history/proof-history.component';
import { EmployeeService } from '../../../../services/employee/employee.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private ds: DataService,
    private pop: PopupService,
    private es: EmployeeService,
  ) {}

  isTimedIn: boolean = false;
  buttonLoading = false;
  attendance: any[] = [];
  formattedAttendance: any[] = [];
  currentTimeIn: string | null = null;
  currentTimeOut: string | null = null;
  employee: any;
  currentMonthYear: string = '';
  currentTime: string = '';
  currentDate: string = '';
  accumulatedHours: string = '0h 0m';
  dateFilter: any = null;
  filterValue = '';
  columns: any;
  payrolls: any = null;
  payroll: any = null;
  release_date: string = '';
  release_dates: any = [];

  ngOnInit(): void {
    this.updateCurrentMonthYear();
    this.employee = this.es.getEmployee();
    this.calculateAccumulatedHours();
    this.buttonLoading = true;

    this.ds.request('GET', 'employee/attendance').subscribe({
      next: (res: any) => {
        this.attendance = res.data.attendance;
        this.currentTimeIn = res.data.current.time_in;
        this.currentTimeOut = res.data.current.time_out;

        if (this.currentTimeIn) this.isTimedIn = true;
        if (this.currentTimeOut) this.isTimedIn = false;

        this.formatAttendanceData();
        // this.setAttendanceProof();
        this.updateCurrentMonthYear();
      },
      error: (err: any) => {
        this.pop.swalBasic('error', this.pop.genericErrorTitle, err.error.message);
      },
      complete: () => { this.buttonLoading = false; }
    });

    this.updateDateTime();
      setInterval(() => {
        this.updateDateTime();
      }, 1000);
  }

  updateCurrentMonthYear() {
    const now = new Date();
    this.currentMonthYear = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }
  

  formatAttendanceData() {
    if (!this.attendance.length) return;

    this.formattedAttendance = this.attendance.map(record => {
      const dateObj = new Date(record.time_in || record.time_out || new Date());
      const monthYear = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
      const day = dateObj.toLocaleString('default', { weekday: 'long' });
      const date = dateObj.toLocaleDateString();

      this.currentMonthYear = monthYear;

      return {
        date,
        day,
        time_in: record.time_in ? new Date(record.time_in).toLocaleTimeString() : null,
        time_out: record.time_out ? new Date(record.time_out).toLocaleTimeString() : null
      };
    });
    this.calculateAccumulatedHours();
  }

  updateDateTime(): void {
    const now = new Date();

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    };

    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };

    const timePart = now.toLocaleTimeString('en-US', timeOptions);
    const datePart = now.toLocaleDateString('en-US', dateOptions);
  
    // this.currentDateTime = `${datePart}, ${timePart}`;

    this.currentTime = timePart;
    this.currentDate = datePart;
  }

  getData() {
    this.ds.request('GET', 'admin/payrolls').subscribe({
      next: (res: any) => {
        this.columns = res.data.columns;
        this.dateFilter = Object.keys(res.data.columns);
        this.payrolls = res.data.payrolls;
        this.filterValue = this.dateFilter[0];
        this.release_dates = res.data.release_dates;
        this.release_date = this.release_dates[this.filterValue];

        this.changeData();
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops! Cannot fetch payrolls!', this.pop.genericErrorMessage);
      }
    });
  }
  
  changeData() {
    this.payroll = this.payrolls[this.filterValue]
    this.release_date = this.release_dates[this.filterValue]
  }  
 
  toggleTime() {
    this.buttonLoading = true;
    const now = new Date();
    
    // Format time and date correctly
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const formattedDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
    this.ds.request('POST', 'employee/attendance/clock').subscribe({
      next: (res: any) => {
        this.pop.toastWithTimer('success', res.message);
        this.isTimedIn = !this.isTimedIn;
  
        // Ensure the date is always correctly formatted
        this.currentDate = formattedDate;
  
        let record = this.attendance.find(element => element.date === formattedDate);
  
        if (record) {
          if (this.isTimedIn) {
            record.time_in = formattedTime; // Update Time In
            this.currentTimeIn = formattedTime;
          } else {
            record.time_out = formattedTime; // Update Time Out
            this.currentTimeOut = formattedTime;
          }
        } else {
          this.attendance.push({
            date: formattedDate, // Store formatted date
            day: now.toLocaleDateString('en-US', { weekday: 'long' }),
            time_in: this.isTimedIn ? formattedTime : null,
            time_out: !this.isTimedIn ? formattedTime : null,
          });
        }
  
        this.formatAttendanceData();
      },
      error: (err: any) => {
        this.pop.swalBasic('error', this.pop.genericErrorTitle, err.error.message);
      },
      complete: () => {
        this.buttonLoading = false;
      }
    });
  }
  
  calculateAccumulatedHours() {
    let totalMinutes = 0;
  
    this.attendance.forEach(record => {
      if (record.time_in && record.time_out) {
        const timeIn = new Date(record.time_in);
        const timeOut = new Date(record.time_out);
  
        if (!isNaN(timeIn.getTime()) && !isNaN(timeOut.getTime())) {
          const diffMinutes = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60);
          totalMinutes += diffMinutes;
        }
      }
    });
  
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    this.accumulatedHours = `${hours}h ${minutes}m`;
  }
}
