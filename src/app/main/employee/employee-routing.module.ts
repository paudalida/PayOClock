import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PayslipsComponent } from './components/payslips/payslips.component';
import { PayslipHistoryComponent } from './components/payslips/payslip-history/payslip-history.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AnnouncementsComponent } from './components/announcements/announcements.component';
import { RequestComponent } from './components/request/request.component';



const routes: Routes = [
  { path: '', redirectTo: 'attendance', pathMatch: 'full' }, 
  // { path: 'dashboard', 
  //   children: [ 
  //     { path: '', component: DashboardComponent, pathMatch: 'full' },
  //     { path: 'announcement', component: AnnouncementsComponent }
  //   ]
  // },
  { path: 'attendance', component: AttendanceComponent}, 
  { 
    path: 'payslips',
    children: [
      { path: '', component: PayslipsComponent, pathMatch: 'full'}, 
      { path: 'payslips-history', component: PayslipHistoryComponent}
    ]  
  },
  { path: 'request', component: RequestComponent},
  { path: 'announcement', component: AnnouncementsComponent },
  { path: 'profile', component: ProfileComponent}, 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
