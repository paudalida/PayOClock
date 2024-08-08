import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const modules = [
  MatTableModule,
  MatPaginatorModule,
  MatFormFieldModule,
  FormsModule,
  ReactiveFormsModule
]

@NgModule({
  declarations: [],
  imports: [ modules ],
  exports: [ modules ]
})
export class FormsImportsModule { }
