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
    full_name: null,
    first_name: null,
    middle_name: null,
    last_name: null,
    ext_name: null,
    gender: null,
    position: null,
    phone_number: null,
    image: null,
    hourly_rate: null,
    completed_payday: null
  };

  public setEmployees(data: any[]) {
    data.sort((a, b) => a.first_name.localeCompare(b.first_name));
    this.employeesArray = data;
  }  

  public setEmployee(data: any) {
    this.employeeData = {
      id: data.id || null,
      type: data.type || null,
      employee_id: data.employee_id || null,
      full_name: data.full_name || null,
      first_name: data.first_name || null,
      middle_name: data.middle_name || null,
      last_name: data.last_name,
      ext_name: data.ext_name || null,
      gender: data.gender || null,
      position: data.postiion || null,
      phone_number: data.phone_number || null,
      image: data.image || null,
      hourly_rate: data.hourly_rate || null,
      completed_payday: data.completed_payday || null
    };
  }

  public getEmployees() {
    return this.employeesArray;
  }

  public getEmployee() {
    return this.employeeData;
  }
}
