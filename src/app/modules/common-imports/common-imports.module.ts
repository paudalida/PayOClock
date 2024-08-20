import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

const modules = [
  CommonModule,
  MatProgressSpinner
];

@NgModule({
  declarations: [],
  imports: [ modules ],
  exports: [ modules ]
})
export class CommonImportsModule { }
