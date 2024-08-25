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
import { EditProfileComponent } from './components/popup/edit-profile/edit-profile.component';


@NgModule({
  declarations: [  
    DashboardComponent, 
    EmployeeComponent, 
    PayslipsComponent, 
    AttendanceComponent, 
    ProfileComponent, EditProfileComponent
  ],
  imports: [
    EmployeeRoutingModule,
    CommonModule,
    CommonImportsModule,
    FormsImportsModule,
  ]
})
export class EmployeeMainModule { }
