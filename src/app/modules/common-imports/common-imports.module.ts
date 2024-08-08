import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

const modules = [
  CommonModule,
  RouterModule
];

@NgModule({
  declarations: [],
  imports: [ modules ],
  exports: [ modules ]
})
export class CommonImportsModule { }
