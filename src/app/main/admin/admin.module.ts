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

import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';

import { PayslipComponent } from './components/payslip/payslip.component';
import { PayslipFormComponent } from './components/payslip/payslip-form/payslip-form.component';
import { PayslipHistoryComponent } from './components/payslip/payslip-history/payslip-history.component';
import { PayrollComponent } from './components/payroll/payroll.component';

import { AnnouncementsComponent } from './components/announcements/announcements.component';
import { AnnouncementFormComponent } from './components/dialogs/announcement-form/announcement-form.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { ViewDetailsComponent } from './components/employee/view-details/view-details.component';
import { EmpSpinnerComponent } from '../admin/spinner/spinner.component';
import { AttendanceDetailPopupComponent } from './components/attendance/attendance-detail-popup/attendance-detail-popup.component';
import { AttendanceHistoryComponent } from './components/attendance/attendance-history/attendance-history.component';

import { ChartModule } from 'primeng/chart';
import { ConfigFormComponent } from './components/dialogs/config-form/config-form.component';
import { SettingsComponent } from './components/settings/settings.component';
import { RequestComponent } from './components/request/request.component';
import { ImportComponent } from './components/employee/import/import.component';
import { ViewRequestComponent } from './components/request/view-request/view-request.component';
import { UpdateComponent } from './components/payslip/update/update.component';
import { ArchivesComponent } from './components/archives/archives.component';
import { ProfileComponent } from './components/settings/profile/profile.component';
import { ChangePassComponent } from './components/settings/profile/change-pass/change-pass.component';
import { ChangePassEmployeeComponent } from './components/settings/profile/change-pass-employee/change-pass-employee.component';
import { AnnouncementComponent } from './components/archives/announcement/announcement.component';
import { IndivPayslipComponent } from './components/payroll/indiv-payslip/indiv-payslip.component';
import { PayrollSumComponent } from './components/payroll/payroll-sum/payroll-sum.component';
import { ActivitylogsComponent } from './components/activitylogs/activitylogs.component';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { ToggleActionAdminComponent } from './components/dashboard/toggle-action-admin/toggle-action-admin.component';
import { ReportsComponent } from './components/reports/reports.component';

@NgModule({
  declarations: [
    AdminComponent,
    AttendanceComponent,
    DashboardComponent,
    EmployeeComponent,
    PayslipComponent,
    PayslipFormComponent,
    PayslipHistoryComponent,
    PayrollComponent,

    AnnouncementsComponent,
    EmpSpinnerComponent,

    /* Dialog imports */
    AnnouncementFormComponent,
    EmployeeFormComponent,
    PayrollFormsComponent,
    ViewDetailsComponent,
    AttendanceDetailPopupComponent,
    AttendanceHistoryComponent,
    ConfigFormComponent,
    SettingsComponent,
    RequestComponent,
    ImportComponent,
    ViewRequestComponent,
    UpdateComponent,
    ArchivesComponent,
    ProfileComponent,
    ChangePassComponent,
    ChangePassEmployeeComponent,
    AnnouncementComponent,
    IndivPayslipComponent,
    PayrollSumComponent,
    ActivitylogsComponent,
    ToggleActionAdminComponent,
    ReportsComponent
    
  ],
  imports: [
    AdminRoutingModule,
    CommonImportsModule,
    FormsImportsModule,
    MatSidenavModule, 
    MatListModule, 
    ChartModule,

    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,

    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule
  ]
})
export class AdminMainModule { }
