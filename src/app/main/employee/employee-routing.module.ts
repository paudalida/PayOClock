import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  // { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
  // { path: 'dashboard', component: DashboardComponent}, 
  // {
  //   path: 'dashboard', 
  //   component: DashboardComponent, 
  //   children: [{
  //     path: '', 
  //     loadChildren: ()=>import('./components/dashboard/dashboard.module').then((m)=>m.DashboardModule)
  //   }]
  // }, 
  // { path: 'employee', component: EmployeeComponent}, 
  
  // {
  //   path: 'payroll', 
  //   component: PayrollComponent, 
  //   children: [{
  //     path: '', 
  //     loadChildren: ()=>import('./components/payroll/payroll.module').then((m)=>m.PayrollModule)
  //   }]
  // }, 
  // {
  //   path: 'payslip', 
  //   component: PayslipComponent, 
  //   children: [{
  //     path: '', 
  //     loadChildren: ()=>import('./components/payslip/payslip.module').then((m)=>m.PayslipModule)
  //   }]
  // }, 
  // {
  //   path: 'report', 
  //   component: ReportComponent, 
  //   children: [{
  //     path: '', 
  //     loadChildren: ()=>import('./components/report/report.module').then((m)=>m.ReportModule)
  //   }]
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
