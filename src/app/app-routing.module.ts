import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from './components/landing/landing.component';
import { EmployeeComponent as EmployeeLoginComponent } from './components/login/employee/employee.component';
import { AdminComponent as AdminLoginComponent } from './components/login/admin/admin.component';

import { AdminComponent } from './main/admin/admin.component';
import { EmployeeComponent } from './main/employee/employee.component';
import { NotFoundComponent } from './components/error/not-found/not-found.component';

import { canActivateChildGuard } from './guards/can-activate-child.guard';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' }, 
  { path: 'landing', component: LandingComponent }, 
  { path: 'login/admin', component: AdminLoginComponent }, 
  { path: 'login/employee', component: EmployeeLoginComponent }, 
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivateChild: [canActivateChildGuard],
    children: [{
      path: '',
      loadChildren: ()=>import('./main/admin/admin.module').then((m)=>m.AdminMainModule)
    }]
  },
  { 
    path: 'employee', 
    component: EmployeeComponent, 
    canActivateChild: [canActivateChildGuard],
    children: [{
      path: '',
      loadChildren: ()=>import('./main/employee/employee.module').then((m)=>m.EmployeeMainModule)
    }]
  },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
