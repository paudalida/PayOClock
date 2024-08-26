import { NgModule } from '@angular/core';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { EmployeeFormComponent } from './components/dialogs/employee-form/employee-form.component';
import { PayrollFormsComponent } from './components/dialogs/payroll-forms/payroll-forms.component';

import { CommonImportsModule } from '../../modules/common-imports/common-imports.module';
import { FormsImportsModule } from '../../modules/forms-imports/forms-imports.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { PayslipFormComponent } from './components/payroll/payslip-form/payslip-form.component';
import { PayslipHistoryComponent } from './components/payroll/payslip-history/payslip-history.component';
import { PayrollComponent } from './components/payroll/payroll.component';
import { AnnouncementsComponent } from './components/announcements/announcements.component';
import { AnnouncementFormComponent } from './components/dialogs/announcement-form/announcement-form.component';

@NgModule({
  declarations: [
    AdminComponent,
    DashboardComponent,
    EmployeeComponent,
    PayslipFormComponent,
    PayslipHistoryComponent,
    PayrollComponent,
    AnnouncementsComponent,

    /* Dialog imports */
    AnnouncementFormComponent,
    EmployeeFormComponent,
    PayrollFormsComponent
  ],
  imports: [
    AdminRoutingModule,
    CommonImportsModule,
    FormsImportsModule,
    MatSidenavModule, 
    MatListModule
  ]
})
export class AdminMainModule { }
