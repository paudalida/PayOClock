import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PayslipRoutingModule } from './payslip-routing.module';
import { PayslipComponent } from './payslip.component';


@NgModule({
  declarations: [
    PayslipComponent
  ],
  imports: [
    CommonModule,
    PayslipRoutingModule
  ]
})
export class PayslipModule { }
