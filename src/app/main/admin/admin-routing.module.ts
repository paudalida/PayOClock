import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { PayrollComponent } from './components/payroll/payroll.component';
import { AnnouncementsComponent } from './components/announcements/announcements.component';
import { ReportComponent } from './components/report/report.component';
import { PayrollFormsComponent } from './components/dialogs/payroll-forms/payroll-forms.component';
import { AttendanceComponent } from './components/attendance/attendance.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
  { path: 'dashboard', component: DashboardComponent}, 
  { path: 'employees', component: EmployeeComponent}, 
  { path: 'payrolls', component: PayrollComponent}, 
  { path: 'payroll-forms', component: PayrollFormsComponent}, 
  {
    path: 'announcements', 
    component: AnnouncementsComponent, 
    children: [{
      path: '', 
      loadChildren: ()=>import('./components/announcements/announcements.module').then((m)=>m.AnnouncementsModule)
    }]
  }, 
  {
    path: 'attendance', 
    component: AttendanceComponent, 
    children: [{
      path: '', 
      loadChildren: ()=>import('./components/attendance/attendance.module').then((m)=>m.AttendanceModule)
    }]
  }, 
  {
    path: 'reports', 
    component: ReportComponent, 
    children: [{
      path: '', 
      loadChildren: ()=>import('./components/report/report.module').then((m)=>m.ReportModule)
    }]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }