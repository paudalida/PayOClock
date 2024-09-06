import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { PayrollComponent } from './components/payroll/payroll.component';
import { AnnouncementsComponent } from './components/announcements/announcements.component';
import { ReportComponent } from './components/report/report.component';
import { PayrollFormsComponent } from './components/dialogs/payroll-forms/payroll-forms.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { PayslipFormComponent } from './components/payroll/payslip-form/payslip-form.component';
import { PayslipHistoryComponent } from './components/payroll/payslip-history/payslip-history.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
  { path: 'dashboard', component: DashboardComponent}, 
  { path: 'employees', component: EmployeeComponent}, 
  {
    path: 'payrolls',
    children: [
      { path: '', component: PayrollComponent, pathMatch: 'full'}, 
      { path: 'form', component: PayrollFormsComponent}, 
      { path: 'payslip', component: PayslipFormComponent},
      { path: 'payslips-history', component: PayslipHistoryComponent}
    ]
  },
  { path: 'announcements', component: AnnouncementsComponent }, 
  { path: 'attendance', component: AttendanceComponent }, 
  { path: 'reports', component: ReportComponent },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }