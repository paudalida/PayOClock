import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
// import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { DataService } from '../../../../services/data/data.service';
import { AdminService } from '../../../../services/admin/admin.service';
import { PopupService } from '../../../../services/popup/popup.service';
// import { MatPaginatorIntl } from '@angular/material/paginator';

import * as ExcelJS from 'exceljs'; 
import { saveAs } from 'file-saver'; 
import { filter } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {
  // dataSource: any = null;
  // fixedColumns: string[] = ['employee_id', 'name', 'position', 'rate'];
  // scrollableColumns: any = [];
  fixedColumns = ['Employee ID', 'Name', 'Position', 'Rate'];
  payrolls: any = null;
  payroll: any = null;
  dateFilter: any = null;
  filterValue = '';
  columns: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    // private paginatorIntl: MatPaginatorIntl,
    // private changeDetectorRef: ChangeDetectorRef, 
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService
  ) {
    // this.paginator = new MatPaginator(this.paginatorIntl, this.changeDetectorRef);
  }

  ngOnInit(): void {
    this.ds.request('GET', 'admin/payrolls').subscribe({
      next: (res: any) => {
        this.columns = res.data.columns;
        this.dateFilter = Object.keys(res.data.columns);
        this.payrolls = res.data.payrolls;
        this.filterValue = this.dateFilter[0];

        this.changeData();
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops! Cannot fetch payrolls!', this.pop.genericErrorMessage);
      }
    });
  }

  get employees() {
    return this.as.getEmployees();
  }

  changeData() {
    // this.scrollableColumns = this.columns[this.filterValue];

    // this.payrolls[this.filterValue].forEach((element: any) => {
    //   let employee = this.employees.find((emp: any) => emp.id === element.user_id);

    //   if(employee) {
    //     element.name = employee.full_name;
    //     element.position = employee.position;
    //     element.employee_id = employee.employee_id;
    //   }
    // });

    // this.dataSource = new MatTableDataSource<PeriodicElement>(this.payrolls[this.filterValue]);

    this.payroll = this.payrolls[this.filterValue]
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

  // EXCEL FILE 
  async generateReport(): Promise<void> {
    if (!this.payrolls || !this.filterValue) {
      this.pop.swalBasic('error', 'No data available', 'Please select a valid date range.');
      return;
    }
  
    const selectedPayroll = this.payrolls[this.filterValue];
    const allHeaders = Object.keys(selectedPayroll[0]);
  
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Report');
  
    // Set all rows height to 25px
    for (let rowNum = 12; rowNum <= 1000; rowNum++) { 
      worksheet.getRow(rowNum).height = 55;
    }
  
    // Add logos (fixed on the header)
    const leftLogoPath = '/assets/images/gm18.png';
    const leftLogoBase64 = await this.loadImageAsBase64(leftLogoPath);
    const leftLogo = workbook.addImage({
      base64: leftLogoBase64,
      extension: 'png',
    });
  
    worksheet.addImage(leftLogo, {
      tl: { col: 2, row: 2 },
      ext: { width: 200, height: 200 },
    });
  
    worksheet.mergeCells('A1:' + String.fromCharCode(65 + allHeaders.length - 1) + '2');
    worksheet.mergeCells('A5:' + String.fromCharCode(65 + allHeaders.length - 1) + '5');
    worksheet.mergeCells('A10:' + String.fromCharCode(65 + allHeaders.length - 1) + '11');
    worksheet.mergeCells('A3:' + String.fromCharCode(65 + allHeaders.length - 1) + '4');
  
    const gm18Cell = worksheet.getCell('A3');
    gm18Cell.value = 'GM18 DRIVING SCHOOL';
    gm18Cell.alignment = { horizontal: 'center', vertical: 'middle' };
    gm18Cell.font = { bold: true, size: 20, name: 'Poppins' };
    gm18Cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF' },
    };
  
    const companyDetails = [
      '106 Gordon Avenue, New Kalalake, Olongapo City, Philippines 2200', // Row 6
      'Olongapo City, Philippines 2200', // Row 7
      'Tel No.: (047) 222-2446 / Cell No.: 0999 220 0158' // Row 8
    ];
  
    companyDetails.forEach((detail, index) => {
      const row = index + 6;  // Start placing company details from row 6
      worksheet.mergeCells(`A${row}:${String.fromCharCode(65 + allHeaders.length - 1)}${row}`);
      const cell = worksheet.getCell(`A${row}`);
      cell.value = detail;
  
      // Apply center alignment and other styling
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true, size: 12, name: 'Poppins' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' },
      };
    });
  
    // Add PAYDATE and CUT-OFF PERIOD rows (shifted down accordingly)
    worksheet.mergeCells(`A9:${String.fromCharCode(65 + allHeaders.length - 1)}9`);
    const payDateCell = worksheet.getCell('A9');
    payDateCell.value = `PAYDATE: ${this.filterValue}`;
  
    payDateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    payDateCell.font = { bold: true, size: 12, name: 'Poppins' };
    payDateCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF' },
    };
  
    const secondRowData = selectedPayroll[0];  // Use the first row data as headers.
    Object.keys(secondRowData).forEach((header, index) => {
      const col = String.fromCharCode(65 + index);
      const headerCell = worksheet.getCell(`${col}12`);  // Set header starting at row 12.
  
      headerCell.value = header;  // Set the header name
  
      headerCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerCell.font = { bold: true, color: { argb: 'FFFFFF' }, name: 'Poppins' };  // White font color
      headerCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
  
      headerCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '254CA3' }, // Blue background
      };
  
      // Adjust column width dynamically based on header length
      worksheet.getColumn(index + 1).width = Math.max(header.length + 5, 15);
    });
  
    worksheet.getColumn(2).width = 50;  
    worksheet.getColumn(3).width = 30;  
    worksheet.getColumn(5).width = 23;  
  
    // Add data rows starting from row 12, skipping the first row
    selectedPayroll.forEach((row: { [key: string]: any }, rowIndex: number) => {
      Object.keys(row).forEach((header, colIndex) => {
        const col = String.fromCharCode(65 + colIndex);
        const startCell = `${col}${12 + rowIndex}`;
        const cell = worksheet.getCell(startCell);
  
        cell.value = row[header] || 'N/A';
  
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        if (12 + rowIndex === 12) {
          cell.font = { name: 'Poppins', size: 12, color: { argb: 'FFFFFF' } };
        } else {
          cell.font = { name: 'Poppins', size: 12 };
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });
  
    // Save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Payroll_Report_${this.filterValue}.xlsx`);
  }
  
  // Helper method to convert an image to Base64
  private async loadImageAsBase64(imagePath: string): Promise<string> {
    const response = await fetch(imagePath); // Fetch the image from the path
    const blob = await response.blob(); // Convert the response to a Blob object

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader(); // Use FileReader to read the blob
      reader.onloadend = () => resolve(reader.result as string); // Resolve with Base64 string
      reader.onerror = reject; // Handle errors
      reader.readAsDataURL(blob); // Read the blob as a data URL
    });
  }

  confirmSyncPay(): void {
    Swal.fire({
      title: 'Update attendance pay?',
      text: 'This will refresh the attendance data and update the payroll.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#254CA3',
      cancelButtonColor: '#cb001e',
      confirmButtonText: 'Yes, sync it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.syncPay();
        Swal.fire(
          'Synced!',
          'The attendance pay has been updated successfully.',
          'success'
        );
      }
    });
  }
  
  syncPay(): void {
    // Here mo lagay yung ilalatag mo kako sa front, Thanks C
  }  
}

export interface PeriodicElement {
  employee_id: string;
  name: string;
  position: string;
  rate: string;
  allowance: string;
  contributions: string;
  other_deductions: string;
  total_deductions: string;
  net_salary: string;
  total_salary: string;
}
