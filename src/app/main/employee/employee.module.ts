import { NgModule } from '@angular/core';

import { EmployeeRoutingModule } from './employee-routing.module';

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
    EmployeeRoutingModule
    // AdminRoutingModule,
    // CommonImportsModule,
    // FormsImportsModule,
  ]
})
export class EmployeeMainModule { }
