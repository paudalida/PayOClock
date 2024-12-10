import { NgModule } from '@angular/core';

import { EmployeeRoutingModule } from './employee-routing.module';
import { CommonModule } from '@angular/common';

import { CommonImportsModule } from '../../modules/common-imports/common-imports.module';
import { FormsImportsModule } from '../../modules/forms-imports/forms-imports.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeComponent } from './employee.component';
import { PayslipsComponent } from './components/payslips/payslips.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AnnouncementsComponent } from './components/dashboard/announcements/announcements.component';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { ViewAnnouncementComponent } from './components/dashboard/view-announcement/view-announcement.component';
import { UploadProofComponent } from './components/attendance/upload-proof/upload-proof.component';
import { PayslipHistoryComponent } from './components/payslips/payslip-history/payslip-history.component';
import { ChangePasswordComponent } from './components/profile/change-password/change-password.component';
import { ProofHistoryComponent } from './components/attendance/proof-history/proof-history.component';
import { RequestComponent } from './components/request/request.component';
import { RequestFormComponent } from './components/request/request-form/request-form.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [  
    DashboardComponent, 
    EmployeeComponent, 
    PayslipsComponent, 
    AttendanceComponent, 
    ProfileComponent, 
    AnnouncementsComponent, 
    ViewAnnouncementComponent, 
    UploadProofComponent, 
    PayslipHistoryComponent, 
    ChangePasswordComponent, ProofHistoryComponent, RequestComponent, RequestFormComponent

  ],
  imports: [
    EmployeeRoutingModule,
    CommonModule,
    CommonImportsModule,
    FormsImportsModule,
    MatSidenavModule, 
    MatListModule, 
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class EmployeeMainModule { }
