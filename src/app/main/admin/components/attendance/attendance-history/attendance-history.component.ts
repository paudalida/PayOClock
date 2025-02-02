import { Component, Inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from '../../../../../services/admin/admin.service';
import { Router } from '@angular/router';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-attendance-history',
  templateUrl: './attendance-history.component.html',
  styleUrls: ['./attendance-history.component.scss']
})
export class AttendanceHistoryComponent {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  employee: any;
  dataSource: any;
  dtrRecords: any[] = [];
  attendance: any;
  dates: any = [];
  defaultRecord = {
    user_id: '',
    status: ''
  };
  attendanceWeeks: any;
  selectedDateRange: string = '';

  get employees() {
    return this.as.getEmployees();
  }

  constructor(
    private as: AdminService,
    private router: Router,
    public dialogRef: MatDialogRef<AttendanceHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.employee = data.employee;
    this.prepareDTRRecords();
  }

  prepareDTRRecords() {
    this.dtrRecords = [
      { day: 'Monday', date: this.employee.mon.date, status: this.employee.mon.status, time_in: this.employee.mon.time_in, time_out: this.employee.mon.time_out },
      { day: 'Tuesday', date: this.employee.tue.date, status: this.employee.tue.status, time_in: this.employee.tue.time_in, time_out: this.employee.tue.time_out },
      { day: 'Wednesday', date: this.employee.wed.date, status: this.employee.wed.status, time_in: this.employee.wed.time_in, time_out: this.employee.wed.time_out },
      { day: 'Thursday', date: this.employee.thu.date, status: this.employee.thu.status, time_in: this.employee.thu.time_in, time_out: this.employee.thu.time_out },
      { day: 'Friday', date: this.employee.fri.date, status: this.employee.fri.status, time_in: this.employee.fri.time_in, time_out: this.employee.fri.time_out },
      { day: 'Saturday', date: this.employee.sat.date, status: this.employee.sat.status, time_in: this.employee.sat.time_in, time_out: this.employee.sat.time_out },
      { day: 'Sunday', date: this.employee.sun.date, status: this.employee.sun.status, time_in: this.employee.sun.time_in, time_out: this.employee.sun.time_out }
    ];
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

  dateFilter(event: Event) {
    const date = (event.target as HTMLSelectElement).value
    this.formatData(this.attendance[date]);
    this.generateDateRange(date);
  }

  downloadPDF(): void {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Daily Time Record - ${this.employee.name}`, 14, 15);

    // Table Headers
    const headers = [['Date', 'Status', 'Time In', 'Time Out']];

    // Table Data
    const rows = this.dtrRecords.map((record) => [
      this.formatFullDate(record.date, record.day),
      record.status,
      record.time_in || 'N/A',
      record.time_out || 'N/A'
    ]);

    // AutoTable Options
    (doc as any).autoTable({
      head: headers,
      body: rows,
      startY: 25,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 122, 204] }, // Header background color
      alternateRowStyles: { fillColor: [240, 240, 240] } // Alternate row color
    });

    // Save PDF
    doc.save(`DTR-${this.employee.name}.pdf`);
  }

  formatFullDate(dateString: string, dayName: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) + ` (${dayName})`;
  }

  closePopup() {
    this.dialogRef.close(); 
    this.router.navigate(['/admin/attendance']);
  }
}
