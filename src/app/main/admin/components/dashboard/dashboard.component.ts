import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../services/admin/admin.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  tableData: any[] = [];
  barChartData: any;
  doughnutChartData: any;
  options: any;

  constructor(
    private as: AdminService
  ) { }

  details = {
    employeeCount: 0,
    processed: 6,
    pending: 4
  }

  ngOnInit(): void {
    this.details.employeeCount = this.as.getEmployees().length;

    this.tableData = [
      { monday: 5, tuesday: 7, wednesday: 5, thursday: 6, friday: 8, saturday: 9 },
      { monday: 2, tuesday: 2, wednesday: 3, thursday: 1, friday: 1, saturday: 1 },
      { monday: 3, tuesday: 1, wednesday: 2, thursday: 3, friday: 1, saturday: 0 }
    ];

    // Bar chart data
    const firstPayroll = [15000, 17000, 14000, 16000, 18000, 19000];  
    const secondPayroll = [8000, 9000, 7000, 5000, 10000, 11000];     

    this.barChartData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [
        {
          label: 'First Payroll of the Month',
          backgroundColor: '#254ca3db',
          data: firstPayroll
        },
        {
          label: 'Second Payroll of the Month',
          backgroundColor: '#789dc9',
          data: secondPayroll
        }
      ]
    };

    // Doughnut chart data
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');

  // Calculate totals for each category
  const presentCount = this.tableData[0].monday + this.tableData[0].tuesday + this.tableData[0].wednesday +
                        this.tableData[0].thursday + this.tableData[0].friday + this.tableData[0].saturday;
  const lateCount = this.tableData[1].monday + this.tableData[1].tuesday + this.tableData[1].wednesday +
                     this.tableData[1].thursday + this.tableData[1].friday + this.tableData[1].saturday;
  const absentCount = this.tableData[2].monday + this.tableData[2].tuesday + this.tableData[2].wednesday +
                       this.tableData[2].thursday + this.tableData[2].friday + this.tableData[2].saturday;

  this.doughnutChartData = {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [
      {
        data: [presentCount, lateCount, absentCount],
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
}
