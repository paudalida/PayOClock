import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { EmployeeComponent } from './components/employee/employee.component';


@NgModule({
  declarations: [
    MainComponent,
    
  ],
  imports: [
    CommonModule,
    MainRoutingModule
  ]
})
export class MainModule { }
