import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrollComponent } from './payroll.component';
import { PayrollFormsComponent } from '../dialogs/payroll-forms/payroll-forms.component';

const routes: Routes = [{ path: '', component: PayrollFormsComponent }];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollRoutingModule { }
