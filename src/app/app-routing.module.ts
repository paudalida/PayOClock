import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';

import { AdminComponent } from './main/admin/admin.component';
import { EmployeeComponent } from './main/employee/employee.component';

import { canActivateChildGuard } from './guards/can-activate-child.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: LandingComponent }, 
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [canActivateChildGuard],
    children: [{
      path: '',
      loadChildren: ()=>import('./main/admin/admin.module').then((m)=>m.AdminMainModule)
    }]
  },
  { 
    path: 'employee', 
    component: EmployeeComponent, 
    canActivate: [canActivateChildGuard],
    children: [{
      path: '',
      loadChildren: ()=>import('./main/employee/employee.module').then((m)=>m.EmployeeMainModule)
    }]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
