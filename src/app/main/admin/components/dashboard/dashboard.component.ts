import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin/admin.service';
import { ChartModule } from 'primeng/chart';
import { DataService } from '../../../../services/data/data.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  defaults = {
    absent: 0,
    present: 0,
    late: 0
  };

  tableData = {
    Monday: this.defaults,
    Tuesday: this.defaults,
    Wednesday: this.defaults,
    Thursday: this.defaults,
    Friday: this.defaults,
    Saturday: this.defaults
  };

  payrollsTotal: any = {
    labels: [],
    data: []
  };
  barChartData: any;
  doughnutRawData = this.defaults;
  doughnutChartData: any;
  options: any;

  constructor(
    private as: AdminService,
    private ds: DataService,
    private router: Router
  ) { }

  details = {
    employeeCount: 0,
    processed: 0,
    pending: 0
  }

  ngOnInit(): void {
    let employees = this.as.getEmployees();
    this.details.employeeCount = employees.length;
    this.details.processed = employees.filter((employee: any) => employee.status === 'Complete').length;
    this.details.pending = this.details.employeeCount - this.details.processed;
    this.setBarChart();
    this.setDoughnut();
    

    this.ds.request('GET', 'admin/dashboard').subscribe((res: any) => {
      this.tableData = res.data.attendanceWeekly;
      this.doughnutRawData = res.data.attendanceMonthly;
      this.setDoughnut();

      this.payrollsTotal.labels = Object.keys(res.data.payrollSummary);
      this.payrollsTotal.data = res.data.payrollSummary;
      this.setBarChart();
    });

  }

  setBarChart() {
    // const firstPayroll = [15000, 17000, 14000, 16000, 18000, 19000];  
    // const secondPayroll = [8000, 9000, 7000, 5000, 10000, 11000];     

    this.barChartData = {
      labels: this.payrollsTotal.labels,
      datasets: [
        {
          label: 'Total Net Pay of all Employees',
          backgroundColor: '#254ca3db',
          data: this.payrollsTotal.data
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
      labels: ['Present', 'Late', 'Absent'],
      datasets: [
        {
          data: [this.doughnutRawData.present, this.doughnutRawData.late, this.doughnutRawData.absent],
          backgroundColor: [
            documentStyle.getPropertyValue('--present'),
            documentStyle.getPropertyValue('--late'),
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
