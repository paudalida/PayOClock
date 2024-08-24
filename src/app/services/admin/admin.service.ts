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
    gender: null,
    position: null,
    phone_number: null,
    image: null
  };

  public setEmployees(data: any[]) {
    data.sort((a, b) => {
      // Assuming you want to sort by the 'name' property
      if (a.first_name < b.first_name) {
        return -1;  // a comes before b
      }
      if (a.first_name > b.first_name) {
        return 1;   // b comes before a
      }
      return 0;    // a and b are equal
    });
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
