import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {
  fixedColumns: string[] = ['employee_id', 'name', 'position', 'rate'];
  scrollableColumns: string[] = [
    'allowance',
    'contributions',
    'other_deductions',
    'total_deductions',
    'net_salary',
    'total_salary'
  ];

  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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

const ELEMENT_DATA: PeriodicElement[] = [
  {
    employee_id: '1222',
    name: 'Eiichiro Oda',
    position: 'Manager',
    rate: '1000',
    allowance: '200',
    contributions: '150',
    other_deductions: '50',
    total_deductions: '200',
    net_salary: '1200',
    total_salary: '1400'
  },
  {
    employee_id: '1222',
    name: 'Eiichiro Oda',
    position: 'Manager',
    rate: '1000',
    allowance: '200',
    contributions: '150',
    other_deductions: '50',
    total_deductions: '200',
    net_salary: '1200',
    total_salary: '1400'
  },
  {
    employee_id: '1222',
    name: 'Eiichiro Oda',
    position: 'Manager',
    rate: '1000',
    allowance: '200',
    contributions: '150',
    other_deductions: '50',
    total_deductions: '200',
    net_salary: '1200',
    total_salary: '1400'
  },
];