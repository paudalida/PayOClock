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
    image: null,
    hourly_rate: null,
    status: null,
    contact: {
      phone_number: null,
      email: null,
      address: null,
      province: null,
      city: null,
      barangay: null,
      street: null,
      house_number: null,
      zip_code: null
    }
  };

  public setImage(data: any) {
    this.employeeData.image = data;
  }

  public setContact(data: any) {
    this.employeeData.contact = data;
  }

  public setEmployee(data: any) {
    this.employeeData = data;
  }
  
  public getEmployee() {
    return this.employeeData;
  }
}
