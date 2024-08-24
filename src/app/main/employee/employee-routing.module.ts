import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PayslipsComponent } from './components/payslips/payslips.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { ProfileComponent } from './components/profile/profile.component';



const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
  { path: 'dashboard', component: DashboardComponent}, 
  { path: 'payslips', component: PayslipsComponent}, 
  { path: 'attendance', component: AttendanceComponent}, 
  { path: 'profile', component: ProfileComponent}, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
