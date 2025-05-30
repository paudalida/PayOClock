import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin/admin.service';
import { ChartModule } from 'primeng/chart';
import { DataService } from '../../../../services/data/data.service';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ToggleActionAdminComponent } from './toggle-action-admin/toggle-action-admin.component';
import { EmployeeService } from '../../../../services/employee/employee.service';
import { filter } from 'rxjs';

interface ContainerVisibility {
  present: boolean;
  absences: boolean;
  employee: boolean;
  pending: boolean;
  processed: boolean;
  attendance: boolean;
  payroll: boolean;
  summary: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  defaults = {
    absent: 0,
    present: 0
  };

  selectedFilterOption: string = 'week'; 
  containerData: { [key: string]: any } = {
    present: 0,
    absences: 0,
    attendanceMonthly: {
      present: [],
      absences: []
    },
  }
  groupedByMonth: any;
  filterValue = '';
  months: any = [];
  years: any = [];
  weeks: any = [];
  attendance: any;

  tableData = {
    Monday: this.defaults,
    Tuesday: this.defaults,
    Wednesday: this.defaults,
    Thursday: this.defaults,
    Friday: this.defaults,
    Saturday: this.defaults,
    Sunday: this.defaults
  };

  payrollsQuarters: any = [];
  payrollsTotal: any = {
    labels: [],
    data: []
  };
  payrollsRaw: any = [];
  barChartData: any;
  doughnutRawData = this.defaults;
  doughnutChartData: any;
  options: any;
  currentMonth: any;

  containerVisibility: Record<'present' | 'absences' |'attendance_weekly' | 'payroll' | 'attendance_summary', boolean> = {
    attendance_weekly: true,
    payroll: true,
    attendance_summary: true,
    present: true,
    absences: true,
  };
  isLoading = true;
  filterType = 'monthly';
  yearFilterType = '';
  monthFilterType = '';

  constructor(
    private as: AdminService,
    private es: EmployeeService,
    private ds: DataService,
    private router: Router, 
    private datePipe: DatePipe, 
    private dialog: MatDialog
  ) { 
    this.setCurrentMonth();
  }

  details = {
    employeeCount: 0,
    processed: 0,
    pending: 0
  }

  weekDates: string[] = [];

  getCurrentWeekDates(): void {
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
    const monday = new Date(today.setDate(diff));

    this.weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return this.datePipe.transform(d, 'MM-dd-yy')!;
    });
  }

  toggleContainerVisibility(container: string) {
    this.containerVisibility[container as 'present' | 'absences' |'attendance_weekly' | 'payroll' | 'attendance_summary'] = 
      !this.containerVisibility[container as 'present' | 'absences' |'attendance_weekly' | 'payroll' | 'attendance_summary'];
  }

  toggleAction(): void {
    const dialogRef = this.dialog.open(ToggleActionAdminComponent, {
      data: { containerVisibility: this.containerVisibility }  // Pass the containerVisibility to the dialog
    });
  
    dialogRef.componentInstance.visibilityChanged.subscribe((updatedVisibility) => {
      this.containerVisibility = updatedVisibility;  // Update the containerVisibility when the toggle changes
      this.es.setConfig(this.containerVisibility)
      const form = { config: this.containerVisibility };
      this.ds.request('POST', 'view/dashboard/toggle', form).subscribe({
        next: (res: any) => { }
      });
    });
  }

  openPopup(type: string): void {
    let popupData: any[] = [];
    let popupTitle = '';
    let status = 'Present';

    if (type === 'present') {
      popupData = this.containerData['attendanceMonthly']['present'];
    } else if (type === 'absences') {
      status = 'Absent';
      popupTitle = 'Absent Records';
      popupData = this.containerData['attendanceMonthly']['absences'];
    }
  }

  selectFilterOption(): void {
    this.containerData['attendanceMonthly']['present'] = this.groupedByMonth[this.filterValue].attendance;
    this.containerData['attendanceMonthly']['absences'] = this.groupedByMonth[this.filterValue].absences;
    this.containerData['present'] = this.containerData['attendanceMonthly']['present'].length;
    this.containerData['absences'] = this.containerData['attendanceMonthly']['absences'].length;
  }  

  stopPopupPropagation(event: MouseEvent): void {
    event.stopPropagation();  
  }

  setCurrentMonth(): void {
    const currentDate = new Date();
    this.currentMonth = this.datePipe.transform(currentDate, 'MMMM y') || ''; 
  }

  changeType(actionType: string) {
    switch(actionType) {
      case 'duration':
        switch(this.filterType) {
          case 'monthly':
            this.yearFilterType = this.years[0];
            this.months = Object.keys(this.attendance.monthly[this.yearFilterType]);
            this.monthFilterType = this.months[0];
            break;

          case 'yearly':
            this.yearFilterType = this.years[0];
            break;
        }
        break;

      case 'year':
        if(this.filterType === 'monthly') {
          this.months = Object.keys(this.attendance.monthly[this.yearFilterType]);
          this.monthFilterType = this.months[0];
        }
        break;
    }
    
    this.changeData();
  }

  changeData() {
    switch(this.filterType) {
      case 'monthly':
        this.doughnutRawData = this.attendance.monthly[this.yearFilterType][this.monthFilterType];
        break;

      case 'yearly':
        this.doughnutRawData = this.attendance.yearly[this.yearFilterType];
        break;
    }
    this.setDoughnut();
  }

  ngOnInit(): void {
    let employees = this.as.getEmployees();
    this.details.employeeCount = employees.length;
    this.details.processed = employees.filter((employee: any) => employee.status === 'Complete').length;
    this.details.pending = this.details.employeeCount - this.details.processed;
    this.setBarChart();
    this.setDoughnut();    
    this.getCurrentWeekDates();

    this.ds.request('GET', 'admin/dashboard').subscribe((res: any) => {
      this.isLoading = false;
      this.tableData = res.data.attendanceWeekly;

      this.attendance = res.data.attendance;
      this.years = (Object.keys(this.attendance.yearly)).reverse();
      this.weeks = Object.keys(this.attendance.weekly);
      this.yearFilterType = this.years[0];
      this.months = Object.keys(this.attendance.monthly[this.yearFilterType]);
      this.monthFilterType = this.months[0];

      this.doughnutRawData = this.attendance.monthly[this.yearFilterType][this.monthFilterType];
      this.setDoughnut();

      const summary = res.data.payrollSummary;
      this.payrollsRaw = summary;
      this.payrollsQuarters = Object.keys(summary);
      this.payrollsTotal.labels = Object.keys(summary[this.payrollsQuarters[0]]);
      this.payrollsTotal.data = summary[this.payrollsQuarters[0]];
      this.setBarChart();

      if(this.es.getConfig()) this.containerVisibility = this.es.getConfig();
    });

  }

  updateBarChart(event: Event) {
    const quarter = (event.target as HTMLSelectElement).value;
    this.payrollsTotal.labels = Object.keys(this.payrollsRaw[quarter]);
    this.payrollsTotal.data = this.payrollsRaw[quarter];
    this.setBarChart();
  }

  setBarChart() {
    // const labelss = [ 'hi', 'there', 'people', 'all', 'over', 'the', 'world', 'hi', 'there', 'people', 'all', 'over', 'the', 'world', 'hi', 'there', 'people', 'all', 'over', 'the', 'world', 'hi', 'there', 'people', 'all', 'over', 'the', 'world' ];  
    // const amountss = [8000, 9000, 7000, 5000, 10000, 11000, 7500, 8000, 9000, 7000, 5000, 10000, 11000, 7500, 8000, 9000, 7000, 5000, 10000, 11000, 7500, 8000, 9000, 7000, 5000, 10000, 11000, 7500];     

    this.barChartData = {
      labels: this.payrollsTotal.labels,
      // labels: labelss,
      datasets: [
        {
          label: 'Total Net Pay of all Employees',
          backgroundColor: '#254ca3db',
          data: this.payrollsTotal.data,
          // data: amountss
        },
        // {
        //   label: 'Second Payroll of the Month',
        //   backgroundColor: '#789dc9',
        //   data: secondPayroll
        // }
      ]
    };
  }

  setDoughnut() {
    // Doughnut chart data
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    this.doughnutChartData = {
      labels: ['Present', 'Absent'],
      datasets: [
        {
          data: [this.doughnutRawData.present, this.doughnutRawData.absent],
          backgroundColor: [
            documentStyle.getPropertyValue('--present'),
            // documentStyle.getPropertyValue('--late'),
            documentStyle.getPropertyValue('--absent')
          ]
        }
      ]
    };

    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      // Bar chart options
      this.options = {
        bar: {
          maintainAspectRatio: false,
          aspectRatio: 0.8,
          plugins: {
            legend: {
              position: 'bottom',  
              labels: {
                color: textColor,
                padding: 40,  
                font: {
                  family: 'Poppins',
                  size: 14,
                  weight: '500'
                }
              }
            },
            title: {
              display: false
            }
          },
          layout: {
            padding: {
              top: 0,
            }
          },
          scales: {
            x: {
              ticks: {
                color: textColorSecondary,
                font: {
                  family: 'Poppins',
                  weight: '500'
                }
              },
              grid: {
                color: surfaceBorder,  
                borderDash: [5, 5],  
                lineWidth: 1,  
                drawBorder: false
              }
            },
            y: {
              ticks: {
                color: textColorSecondary,
                font: {
                  family: 'Poppins',
                  weight: '500'
                },
                callback: function(value: number) {
                  return '₱' + value.toLocaleString();  
                }
              },
              grid: {
                color: surfaceBorder,  
                borderDash: [5, 5],  
                lineWidth: 1,  
                drawBorder: false
              },
              suggestedMin: 0,
              suggestedMax: 20000
            }  
          }
        },
      
        doughnut: {
          maintainAspectRatio: false,
          aspectRatio: 0.8,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: textColor,
                padding: 40,
                font: {
                  family: 'Poppins',
                  size: 14,
                  weight: '500'
                }
              }
            },
            title: {
              display: false
            },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function(tooltipItem: any) {
                  const dataIndex = tooltipItem.dataIndex;
                  const data = tooltipItem.dataset.data[dataIndex];
                  const label = tooltipItem.label;
                  return `${label}: ${data}`;
                }
              }
            }
          },
          layout: {
            padding: {
              top: 0,
            }
          },
          elements: {
            arc: {
              borderWidth: 0 
            }
          }
        }
      };    
  }
  
  getStatus(index: number): string {
    if (index === 0) return 'Present';
    if (index === 1) return 'Late';
    return '';
  }

  getStatusClass(index: number): string {
    if (index === 0) return 'status-present';
    if (index === 1) return 'status-late';
    return '';
  }

  navigate(link: string) {
    const url = 'admin/' + link;
    this.router.navigate([url]);
  }
}
