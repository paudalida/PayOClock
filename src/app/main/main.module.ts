import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { CommonImportsModule } from '../modules/common-imports/common-imports.module';
import { FormsImportsModule } from '../modules/forms-imports/forms-imports.module';


@NgModule({
  declarations: [
    MainComponent
  ],
  imports: [
    MainRoutingModule,
    CommonImportsModule,
    FormsImportsModule,
  ]
})
export class MainModule { }
