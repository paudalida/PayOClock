import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { PayrollComponent } from './components/payroll/payroll.component';
import { PayslipComponent } from './components/payslip/payslip.component';
import { ReportComponent } from './components/report/report.component';
import { PayrollFormsComponent } from './components/dialogs/payroll-forms/payroll-forms.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
  { path: 'dashboard', component: DashboardComponent}, 
  { path: 'employees', component: EmployeeComponent}, 
  { path: 'payrolls', component: PayrollComponent}, 
  { path: 'payroll-forms', component: PayrollFormsComponent}, 
  {
    path: 'payslips', 
    component: PayslipComponent, 
    children: [{
      path: '', 
      loadChildren: ()=>import('./components/payslip/payslip.module').then((m)=>m.PayslipModule)
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