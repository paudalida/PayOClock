import { NgModule } from '@angular/core';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { CommonImportsModule } from '../modules/common-imports/common-imports.module';
import { FormsImportsModule } from '../modules/forms-imports/forms-imports.module';
import { EmployeeComponent } from './components/employee/employee.component';


@NgModule({
  declarations: [
    MainComponent,
    EmployeeComponent
  ],
  imports: [
    MainRoutingModule,
    CommonImportsModule,
    FormsImportsModule,
  ]
})
export class MainModule { }
