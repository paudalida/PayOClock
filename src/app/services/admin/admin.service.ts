import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor() { }

  private employeesArray: any = [];
  private employeeData = {
    id: null,
    type: null,
    employee_id: null,
    first_name: null,
    middle_name: null,
    last_name: null,
    ext_name: null,
    sex: null,
    position: null,
    phone_number: null
  };

  public setEmployees(data: any) {
    data.sort();
    this.employeesArray = data;
  }

  public setEmployee(data: any) {
    this.employeeData = data;
  }

  public getEmployees() {
    return this.employeesArray;
  }

  public getEmployee() {
    return this.employeeData;
  }
}
