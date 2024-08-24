import { NgModule } from '@angular/core';

import { EmployeeRoutingModule } from './employee-routing.module';
import { CommonModule } from '@angular/common';

import { CommonImportsModule } from '../../modules/common-imports/common-imports.module';
import { FormsImportsModule } from '../../modules/forms-imports/forms-imports.module';
import { DashboardComponent } from './dashboard/dashboard.component';


@NgModule({
  declarations: [
    // AdminComponent,
    // EmployeeComponent,
    // EmployeeFormComponent,
    // PayrollFormsComponent
  
    DashboardComponent
  ],
  imports: [
    EmployeeRoutingModule,
    CommonModule
    // AdminRoutingModule,
    // CommonImportsModule,
    // FormsImportsModule,
  ]
})
export class EmployeeMainModule { }
