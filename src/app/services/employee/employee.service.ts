import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor() { }

  private employeeData = {
    id: null,
    type: null,
    employee_id: null,
    full_name: null,
    first_name: null,
    middle_name: null,
    last_name: null,
    ext_name: null,
    gender: null,
    position: null,
    phone_number: null,
    image: null,
    hourly_rate: null
  };

  public setEmployee(data: any) {
    this.employeeData = data;
  }

  public getEmployee() {
    return this.employeeData;
  }
}
