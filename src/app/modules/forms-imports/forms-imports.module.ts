import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { AccountingFormatDirective } from '../../directives/accounting-format.directive';

// Only actual Angular modules should be here
const materialModules = [
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatFormFieldModule,
  FormsModule,
  ReactiveFormsModule
];

@NgModule({
  declarations: [AccountingFormatDirective], // ✅ put the directive here
  imports: [...materialModules],
  exports: [...materialModules, AccountingFormatDirective] // ✅ export it here too
})
export class FormsImportsModule {}
