import { Component, OnInit, signal, effect } from '@angular/core';
import { DataService } from '../../../../services/data/data.service';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrl: './payroll.component.scss'
})
export class PayrollComponent implements OnInit{

  constructor(
    private ds: DataService
  ) { }

  employeeSelected = signal(null);
  signalEffect = effect(()=> { if(this.employeeSelected()) this.openModal() } );

  employees: any;
  ngOnInit(): void {
    this.ds.request('GET', 'admin/employees', null).subscribe(
      (res: any) => { this.employees = res.data; console.log(this.employees) }
    );
  }

  openModal() {
    console.log(this.employeeSelected());
  }
}
