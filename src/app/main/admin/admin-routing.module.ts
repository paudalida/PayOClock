import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeComponent } from './components/employee/employee.component';

import { PayslipComponent } from './components/payslip/payslip.component';
import { AnnouncementsComponent } from './components/announcements/announcements.component';


import { PayrollComponent } from './components/payroll/payroll.component';

import { PayrollFormsComponent } from './components/dialogs/payroll-forms/payroll-forms.component';
import { AttendanceComponent } from './components/attendance/attendance.component';

import { PayslipFormComponent } from './components/payslip/payslip-form/payslip-form.component';
import { PayslipHistoryComponent } from './components/payslip/payslip-history/payslip-history.component';
import { SettingsComponent } from './components/settings/settings.component';
import { RequestComponent } from './components/request/request.component';
import { ArchivesComponent } from './components/archives/archives.component';
import { ProfileComponent } from './components/settings/profile/profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
  { path: 'dashboard', component: DashboardComponent}, 
  { path: 'attendance', component: AttendanceComponent }, 
  {
    path: 'payslips',
    children: [
      { path: '', component: PayslipComponent, pathMatch: 'full'}, 
      { path: 'form', component: PayrollFormsComponent}, 
      { path: 'payslip', component: PayslipFormComponent},
      { path: 'payslips-history', component: PayslipHistoryComponent}
    ]
  },
  { path: 'payroll', component: PayrollComponent },
  { path: 'employees', component: EmployeeComponent}, 
  { path: 'request', component: RequestComponent},
  { path: 'announcements', component: AnnouncementsComponent }, 
  { path: 'settings', 
    children: [ 
      { path: '', component: SettingsComponent, pathMatch: 'full' },
      { path: 'profile', component: ProfileComponent }
    ]
  },
  { path: 'archives', component: ArchivesComponent},
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }