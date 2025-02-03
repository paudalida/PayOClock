import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { DataService } from '../../../../services/data/data.service';
import { AdminService } from '../../../../services/admin/admin.service';
import { PopupService } from '../../../../services/popup/popup.service';
import { AttendanceDetailPopupComponent } from './attendance-detail-popup/attendance-detail-popup.component';
import { AttendanceHistoryComponent } from './attendance-history/attendance-history.component';
import { DatePipe } from '@angular/common';

export interface AttendanceRecord {
  name: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  // [key: string]: string;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  displayedColumns: string[] = ['name', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  dataSource: any;
  dates: any = [];
  dayNames = [ 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun' ];
  filterType = "period";

  dateRanges: string[] = [];
  selectedDateRange: string = '';

  constructor(
    private dialog: MatDialog,
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService,
    private datePipe: DatePipe
  ) { }

  isLoading = false;
  current = '';
  selectedDate: Date | null = null;
  clockedIn: any = [];
  user_id: any;
  attendanceWeeks: any;
  attendance: any;
  defaultRecord = {
    user_id: '',
    status: ''
  };
  groupedRecordsByWeek: any;
  groupedRecordsByPeriod: any;
  groupedRecordsByDay: any;
  weekFilter: any;
  periodFilter: any;
  payrollPeriods: any;
  currFilter = '';
  columns: any = [];

  get employees() {
    return this.as.getEmployees();
  }

  setEmployeeID(data: any) {
    this.defaultRecord.user_id = data;
  }

  groupByWeek(records: any[]) {
    return records.reduce((acc, record) => {
      const date = new Date(record.date);
  
      // Calculate the start of the week (Monday)
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1)); // Adjust for Monday start
  
      // Calculate the end of the week (Sunday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
  
      // Format the key as "YYYY-MM-DD to YYYY-MM-DD"
      const weekKey = `${startOfWeek.toISOString().split('T')[0]} to ${endOfWeek.toISOString().split('T')[0]}`;
  
      // Initialize the weekly group if it doesn't exist
      if (!acc[weekKey]) {
        acc[weekKey] = {};
      }
  
      // Initialize the user group inside the week if it doesn't exist
      if (!acc[weekKey][record.user_id]) {
        acc[weekKey][record.user_id] = [];
      }
  
      // Push the record to the respective user inside the week group
      acc[weekKey][record.user_id].push(record);
  
      return acc;
    }, {} as Record<string, Record<number, any[]>>);
  }  

  groupByPeriod(records: any[], periods: any[]) {
    return records.reduce((acc, record) => {
      const recordDate = new Date(record.date);
  
      // Find the payroll period the record belongs to
      const period = periods.find(p =>
        recordDate >= new Date(p.payday_start) && recordDate <= new Date(p.payday_end)
      );
  
      if (period) {
        const periodKey = `${period.payday_start} to ${period.payday_end}`;
  
        // Initialize the period group if it doesn't exist
        if (!acc[periodKey]) {
          acc[periodKey] = {};
        }
  
        // Initialize the user group if it doesn't exist
        if (!acc[periodKey][record.user_id]) {
          acc[periodKey][record.user_id] = [];
        }
  
        // Push the record into the appropriate group
        acc[periodKey][record.user_id].push(record);
      }
  
      return acc;
    }, {} as Record<string, Record<number, any[]>>);
  }  
  
  ngOnInit(): void {    
    this.isLoading = true;
    this.ds.request('GET', 'admin/attendance').subscribe({
      next: (res: any) => {
        this.groupedRecordsByDay = this.groupByDay(res.data.attendance)
        // this.groupedRecordsByWeek = this.groupByWeek(res.data.attendance)
        // this.groupedRecordsByPeriod = this.groupByPeriod(res.data.attendance, res.data.payroll_periods);
        // this.weekFilter = Object.keys(this.groupedRecordsByWeek)
        this.periodFilter = this.combinePayrollPeriods(res.data.payroll_periods)
        this.currFilter = this.periodFilter[0];
        this.columns = this.getDateRangeFromString(this.currFilter);
        console.log(this.groupedRecordsByDay['2024-12-30'])
        // this.attendance = res.data.records;
        // this.attendanceWeeks = Object.keys(this.attendance);
        // this.generateDateRange(this.attendanceWeeks[0]);
        // this.formatData(this.attendance[this.attendanceWeeks[0]]);

        // this.current = res.data.currentDay;

        // this.selectedDateRange = this.attendanceWeeks[0];
      },
      error: (err: any) => {

      },
      complete: () => { this.isLoading = false; }
    });
  }

  changeFilter() {
    this.columns = this.getDateRangeFromString(this.currFilter)
  }

  getRecordForDay(employeeId: number, day: string): boolean {
    const recordsForDay = this.groupedRecordsByDay[day] || [];
    return recordsForDay.some((record: any) => record.user_id === employeeId);
  }
  
  convertTime(time: string): string {
    if(time == '') return '-';
    // Assuming the time is in the format 'HH:mm:ss'
    const formattedTime = this.datePipe.transform(`1970-01-01T${time}`, 'h:mm a');
    return formattedTime || time;  // Return formatted time or original if formatting fails
  }

  filterByDate(): void {
    if (!this.selectedDate) {
      console.log('No date selected, resetting filter');
      this.formatData(this.attendance[this.selectedDateRange]); // Reset to the full week
      return;
    }
  
    const formattedSelectedDate = this.selectedDate.toISOString().split('T')[0];
    console.log('Selected Date:', formattedSelectedDate);
  
    // Find the week that contains the selected date
    const weekKey = this.attendanceWeeks.find((week: { split: (arg0: string) => { (): any; new(): any; map: { (arg0: (date: any) => Date): [any, any]; new(): any; }; }; }) => {
      const [start, end] = week.split(' - ').map(date => new Date(date));
      return new Date(formattedSelectedDate) >= start && new Date(formattedSelectedDate) <= end;
    });
  
    if (!weekKey) {
      console.warn('Selected date is outside available attendance data.');
      return;
    }
  
    const weeklyData = this.attendance[weekKey];
  
    // Filter records for the selected date
    const filteredRecords = weeklyData.filter((record: any) => {
      return (
        record.mon.date === formattedSelectedDate ||
        record.tue.date === formattedSelectedDate ||
        record.wed.date === formattedSelectedDate ||
        record.thu.date === formattedSelectedDate ||
        record.fri.date === formattedSelectedDate ||
        record.sat.date === formattedSelectedDate ||
        record.sun.date === formattedSelectedDate
      );
    });
  
    console.log('Filtered Records:', filteredRecords);
    this.formatData(filteredRecords); // Update the table with filtered data
  }

  formatData(data: any) {
    let records: any = [];
    this.employees.forEach((element: any) => {
      records.push(
        {
          id: element.id,
          name: element.full_name,
          mon: this.defaultRecord,
          tue: this.defaultRecord,
          wed: this.defaultRecord,
          thu: this.defaultRecord,
          fri: this.defaultRecord,
          sat: this.defaultRecord, 
          sun: this.defaultRecord
        }
      );
    });

    data.forEach((element: any) => {
      let foundRecord = records.find((record: any) => record.id === element.user_id);
      foundRecord.user_id = element.user_id;

      switch(element.day) {
        case 'Monday':
          foundRecord.mon = element;
          break;

        case 'Tuesday':
          foundRecord.tue = element;
          break;

        case 'Wednesday':
          foundRecord.wed = element;
          break;

        case 'Thursday':
          foundRecord.thu = element;
          break;

        case 'Friday':
          foundRecord.fri = element;
          break;

        case 'Saturday':
          foundRecord.sat = element;
          break;

        case 'Sunday' :
          foundRecord.sun = element;
      }
    });

    this.dataSource = new MatTableDataSource(records);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  generateDateRange(key: string) {
    const [start, end] = key.split(' - ').map(date => new Date(date));
    const dates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();

      dates.push(`${year}-${month}-${day}`);
    }

    if (dates.length < 7) {
      const lastDate = new Date(dates[dates.length - 1]);
      lastDate.setDate(lastDate.getDate() + 1);
      const month = String(lastDate.getMonth() + 1).padStart(2, '0');
      const day = String(lastDate.getDate()).padStart(2, '0');
      const year = lastDate.getFullYear();
      dates.push(`${year}-${month}-${day}`);
  }


    this.dates = dates;
  }

  getDateRangeFromString(dateRange: string): string[] {
    // Split the input string by ' to ' to get start and end dates
    const [startDate, endDate] = dateRange.split(' to ');
  
    // Call the function to generate the date array
    return this.getDateRange(startDate, endDate);
  }

  combinePayrollPeriods(payrolls: any[]) {
    return payrolls.map((period, index) => {
      // Convert the dates to strings in the format 'YYYY-MM-DD'
      const startDate = new Date(period.payday_start).toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const endDate = new Date(period.payday_end).toISOString().split('T')[0]; // Format as YYYY-MM-DD
  
      // If this is the last period, extend the end date to today
      if (index === payrolls.length - 1) {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        return `${startDate} to ${endDate} to ${today}`;
      }
  
      // Return the combined string in the format "startDate to endDate"
      return `${startDate} to ${endDate}`;
    });
  }
  
  
  groupByDay(attendanceData: any[]) {
    // Initialize an empty object to hold the grouped data
    let groupedByDay: any = {};
  
    // Loop through the attendance data
    attendanceData.forEach(record => {
      // Assuming each record has a 'date' field, you can format it as YYYY-MM-DD for grouping
      const date = new Date(record.date).toISOString().split('T')[0]; // Format to "YYYY-MM-DD"
  
      // Group by date (day)
      if (!groupedByDay[date]) {
        groupedByDay[date] = []; // If date doesn't exist, create an array
      }
      groupedByDay[date].push(record); // Push record to the correct day
    });
  
    return groupedByDay;
  }
  
  getDateRange(startDate: string, endDate: string): string[] {
    let dates: string[] = [];
    let start = new Date(startDate);
    let end = new Date(endDate);
  
    while (start <= end) {
      dates.push(start.toISOString().split('T')[0]); // Format as "YYYY-MM-DD"
      start.setDate(start.getDate() + 1); // Move to the next day
    }
  
    return dates;
  }

  dateFilter(event: Event) {
    const date = (event.target as HTMLSelectElement).value
    this.formatData(this.attendance[date]);
    this.generateDateRange(date);
  }

  formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  formatTime(time: string) {
    if(!time) return '';
    let hour = parseInt(time.slice(0, 2), 10);
    let ampm = 'AM';
    if(hour > 12) {
      hour = hour - 12;
      ampm = 'PM';
    }

    if(time.length > 5) time = time.slice(2, -3);
    else time = time.slice(2);

    return String(hour) + time + ' ' + ampm;    
  }

  getStatusClass(status: string, day: string): string {
    if(this.selectedDateRange == this.attendanceWeeks[0]) {
      if(this.dayNames.indexOf(day) <= this.dayNames.indexOf(this.current) && day != 'sat' && day != 'sun') {
        if(status == '') status = 'absent';
      }
    } else {
      if(status == '' && day != 'sat') status = 'absent';
    }
    
    switch (status) {
        case 'present':
            return 'status-present';
        case 'late':
            return 'status-late';
        case 'absent':
            return 'status-absent';
        case 'leave':
            return 'status-leave';
        case 'paid-leave':
            return 'status-paid-leave';
        default:
            return 'status-default'; 
    }
  }

  openDTRPopup(employee: any): void {
    const dialogRef = this.dialog.open(AttendanceHistoryComponent, {
      width: '600px',
      data: { employee }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('DTR popup closed with:', result);
      }
    });
  }
  

  openAttendanceDetail(user_id: string, date: any, data?: any): void {
    const now = new Date(); // Get the current date and time
    const givenDate = new Date(date); // Convert the input date to a Date object

    // Check if the given date is in the future compared to the current date
    if (givenDate > now) {
      this.pop.swalBasic('error', 'Oops! Can\'t access date', 'Can\'t access future dates');
      return;
    }
    // this.selectedDate = date;
    if(!data) {
      data = this.defaultRecord;
      data.user_id = user_id
    }

    const dialogRef = this.dialog.open(AttendanceDetailPopupComponent, {
      data: {
        selectedDate: date,
        details: data
      }
    });
  
    dialogRef.afterClosed().subscribe((res: any) => {
      if(res) {
        const index = this.dataSource.data.findIndex((employee: any) => (employee.id === res.user_id));
        if (index === -1) return;

        this.dataSource.data[index][res.day.slice(0,3).toLowerCase()] = res;
      }
    });
  }

  formatFullDate(dateString: string, dayName: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: '2-digit', year: 'numeric' };
    return `${date.toLocaleDateString('en-US', options)} (${dayName})`;
  }

  // openAttendanceHistory() {
  //   if (this.dialog) {
  //     this.dialog.open(AttendanceHistoryComponent);
  //   } else {
  //     console.error('Dialog is not initialized');
  //   }
  // }

  // viewProof(data: any) {
  //   let proof = [];

  //   /* Improve */
  //   if(data.mon.status) {
  //     // if(data.mon.images.length > 0) {
  //       proof.push(data.mon);
  //     // }
  //   }
   
  //   if(data.tue.status) {
  //     // if(data.tue.images.length > 0) {
  //       proof.push(data.tue);
  //     // }
  //   }

  //   if(data.wed.status) {
  //     // if(data.wed.images.length > 0) {
  //       proof.push(data.wed);
  //     // }
  //   }
    
  //   if(data.thu.status) {
  //     // if(data.thu.images.length > 0) {
  //       proof.push(data.thu);
  //     // }
  //   }
    
  //   if(data.fri.status) {
  //     // if(data.fri.images.length > 0) {
  //       proof.push(data.fri);
  //     // }
  //   }
    
  //   if(data.sat.status) {
  //     // if(data.sat.images.length > 0) {
  //       proof.push(data.sat);
  //     // }
  //   }

  //   if (this.dialog) {
  //     this.dialog.open(ViewProofComponent, { data: proof });
  //   } else {
  //     console.error('Dialog is not initialized');
  //   }
  // }

  isBeforeOrNow(date: string) {
    const date2 = '2024-11-01';

    // Convert the string dates to Date objects
    const parsedDate1 = new Date(date);
    const parsedDate2 = new Date(date2);

    // Compare the dates
    return parsedDate1 <= parsedDate2;

  }
}
