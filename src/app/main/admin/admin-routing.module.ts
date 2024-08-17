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
  { path: 'employee', component: EmployeeComponent}, 
  { path: 'payroll-forms', component: PayrollFormsComponent},
  
  {
    path: 'payroll', 
    component: PayrollComponent, 
    children: [{
      path: '', 
      loadChildren: ()=>import('./components/payroll/payroll.module').then((m)=>m.PayrollModule)
    }]
  }, 
  {
    path: 'payslip', 
    component: PayslipComponent, 
    children: [{
      path: '', 
      loadChildren: ()=>import('./components/payslip/payslip.module').then((m)=>m.PayslipModule)
    }]
  }, 
  {
    path: 'report', 
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
