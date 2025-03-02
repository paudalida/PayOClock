import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DataService } from '../../../../services/data/data.service';
import { AdminService } from '../../../../services/admin/admin.service';
import { PopupService } from '../../../../services/popup/popup.service';

import * as ExcelJS from 'exceljs'; 
import { saveAs } from 'file-saver'; 
import { MatDialog } from '@angular/material/dialog';
import { IndivPayslipComponent } from './indiv-payslip/indiv-payslip.component';
import { PayrollSumComponent } from './payroll-sum/payroll-sum.component';
import { UpdateComponent } from '../payslip/update/update.component';
import { Router } from '@angular/router';

interface PayrollSums {
  [key: string]: number; // key is a string, value is a number
}

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})

export class PayrollComponent implements OnInit {
  fixedColumns = ['Employee ID', 'Name', 'Position', 'Rate'];
  showColumns = ['Employee ID', 'Name', 'Position', 'Rate', 'GROSS', 'TOTAL CONTRIBUTIONS', 'TOTAL DEDUCTIONS', 'NET PAY'];
  employeeTypeFilter = '';
  payrolls: any = null;
  payroll: any = null;
  dateFilter: any = null;
  filterValue = '';
  columns: any;
  selectedRow: any = null;
  release_date: string = '';
  release_dates: any = [];
  curr_sums = {
    net_pays: 0,       // Default value for net_pays
    contributions: 0,      // Default value for contributions
    expenses: 0        // Default value for expenses
  };
  sums = {
    net_pays: {} as PayrollSums,
    contributions: {} as PayrollSums,
    expenses: {} as PayrollSums
  };  
  totalIndex: any = {
    net_pays: [],
    contributions: []
  };

  disabledInput = true;
  date = {
    payday_start: '',
    payday_end: ''
  };
  isLoading = true;

  constructor(
    private dialog: MatDialog,
    private ds: DataService,
    private as: AdminService,
    private pop: PopupService,
    private router: Router
  ) {  }

  ngOnInit(): void {
    this.date = this.as.getPayday();
    this.syncPay();
  }

  get employees() {
    return this.as.getEmployees();
  }

  getData() {
    this.ds.request('GET', 'admin/payrolls').subscribe({
      next: (res: any) => {
        this.columns = res.data.columns;
        this.dateFilter = Object.keys(res.data.columns);
        const contribIndex = this.columns[this.dateFilter[0]].findIndex((column: string) => column === 'TOTAL CONTRIBUTIONS');
        const netPaysIndex = this.columns[this.dateFilter[0]].findIndex((column: string) => column === 'NET PAY');
        
        this.totalIndex.contributions = Array(contribIndex);
        this.totalIndex.net_pays = Array(netPaysIndex - contribIndex - 1);

        this.payrolls = res.data.payrolls;
        this.filterValue = this.dateFilter[0];

        const dateRange = this.filterValue; // Get the 0 index value
        const [startDate, endDate] = dateRange.split(' - ').map(date => date.replace(/\//g, '-'));
        this.date.payday_start = startDate;
        this.date.payday_end = endDate;

        this.release_dates = res.data.release_dates;
        this.release_date = this.release_dates[this.filterValue];

        this.sums = {
          net_pays: res.data.total_net_pays,
          contributions: res.data.total_contributions,
          expenses: res.data.total_expenses
        }

        this.curr_sums = {
          net_pays: res.data.total_net_pays[this.filterValue],
          contributions: res.data.total_contributions[this.filterValue],
          expenses: res.data.total_expenses[this.filterValue]
        };

        this.changeData();
      },
      error: (err: any) => {
        this.pop.swalBasic('error', 'Oops! Cannot fetch payrolls!', this.pop.genericErrorMessage);
      }
    });
  }

  showColumn(column: string) {
    return this.showColumns.includes(column);
  }

  changeData() {
    let tempPayroll = JSON.parse(JSON.stringify(this.payrolls[this.filterValue]));
    
    const contribIndex = this.columns[this.filterValue].findIndex((column: string) => column === 'TOTAL CONTRIBUTIONS');
    const netPaysIndex = this.columns[this.filterValue].findIndex((column: string) => column === 'NET PAY');

    this.payroll = [ tempPayroll[0] ];
    let contribTotal = 0; let netTotal = 0;
    for(let i = 1; i < tempPayroll.length; i++) {
      if ((tempPayroll[i][2] == 'Instructor' && this.employeeTypeFilter == 'instructors')  || (tempPayroll[i][2] != 'Instructor' && this.employeeTypeFilter == 'non-instructors') || this.employeeTypeFilter == '') {
        this.payroll.push(tempPayroll[i]);
        contribTotal += Number(tempPayroll[i][contribIndex].replace(/[₱,]/g, ""));
        netTotal += Number(tempPayroll[i][netPaysIndex].replace(/[₱,]/g, ""));
        console.log(Number(tempPayroll[i][contribIndex].replace(/[₱,]/g, "")));
      }
    }
    this.release_date = this.release_dates[this.filterValue]
    // this.curr_sums = {
    //   net_pays: this.sums.net_pays[this.filterValue],
    //   contributions: this.sums.contributions[this.filterValue],
    //   expenses: this.sums.expenses[this.filterValue]
    // };
    
    this.totalIndex.contributions = Array(contribIndex);
    this.totalIndex.net_pays = Array(netPaysIndex - contribIndex - 1);
    const total1 = `₱ ${contribTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const total2 = `₱ ${netTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const total3 = `₱ ${(netTotal + contribTotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const finalRow = [ ...this.totalIndex.contributions, ...[total1], ...this.totalIndex.net_pays, ...[total2]];
    this.payroll.push(finalRow);

    const tempArray = Array(finalRow.length - 2);
    const pinakaFinalRow = [ ...tempArray, ...[ 'TOTAL EXPENSES', total3 ]];
    this.payroll.push(pinakaFinalRow);
  }  

  changeEmployeeType() {
    this.payroll = this.payrolls[this.filterValue];
    const netPayIndex = this.payroll[0].findIndex()
  }

  release() {
    this.pop.swalWithCancel(
    'question', 
    'Release current payroll?', 
    `This will release the current payroll making the payslips available to the employees, mark employee payslip status as completed, and 
    admin would no longer have access to the processes of the current payroll like adding and removing of deductions.
    This action is IRREVERSIBLE, do you want to continue?`
  ).then((result) => {
      if (result) {
        this.ds.request('POST', 'admin/payrolls/release').subscribe({
        next: (res: any) => {
          this.pop.toastWithTimer('success', res.message);
          let emps = this.as.getEmployees();
          emps.forEach((element: any) => {
            element.status = 'Complete';
          });
  
          this.as.setEmployees(emps);
        }
      })
      }
  });;
    
  }

  confirmSyncPay(): void {
    this.pop.swalWithCancel(
      'question', 
      'Update attendance pay?', 
      'This will refresh the attendance data and update the payroll.'
    ).then((result) => {
        if (result) {
          this.syncPay();
        }
    });;
  }
  
  syncPay(): void {
    this.isLoading = true;
    this.ds.request('POST', 'admin/payrolls/process/all/transaction').subscribe({
      next: () => {
        this.getData();
      },
      complete: () => {
        this.isLoading = false;
      }
    })
  }   
  
  setupdate() {
    if (this.dialog) {
      const dialogRef = this.dialog.open(UpdateComponent);

      dialogRef.afterClosed().subscribe(result => {
        if(result) {
          this.date = this.as.getPayday();
          this.syncPay();
        }
      });
    } else {
      console.error('Dialog is not initialized');
    }
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
  
        cell.value = row[header] || '';
  
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

  openDialog(employee_id: number) {
    const employee = this.as.getEmployees().find((emp: any) => emp.employee_id === employee_id);

    if(employee) {
      this.as.setEmployee(employee);

      if(!this.release_date) {
        this.router.navigate(['admin/payroll/form']);
      } else {
        if (this.dialog) {
            let [start, end] = this.filterValue.split(' - ');
  
            this.dialog.open(IndivPayslipComponent, {
              data: {
                start: start.replaceAll('/', '-'),
                end: end.replaceAll('/', '-') 
              }
            })
        } else {
          console.error('Dialog is not initialized');
        }
      }
    }
  }

  openPayroll() {
    if (this.dialog) {
      this.dialog.open(PayrollSumComponent, {
        data: this.payroll
      } );
    } else {
      console.error('Dialog is not initialized');
    }
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
