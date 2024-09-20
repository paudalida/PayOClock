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

  public setEmployees(data: any[]) {
    data.sort((a, b) => a.first_name.localeCompare(b.first_name));
    this.employeesArray = data;
  }  

  public getEmployees() {
    return this.employeesArray;
  }

  public getEmployee() {
    return this.employeeData;
  }

  /* Single record */
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
      position: data.position || null,
      image: data.image || null,
      hourly_rate: data.hourly_rate || null,
      status: data.status || null,
      contact: {
        phone_number: data.contact.phone_number || null,
        email: data.contact.email || null,
        address: data.contact.address || null,
        province: data.contact.province || null,
        city: data.contact.city || null,
        barangay: data.contact.barangay || null,
        street: data.contact.street || null,
        house_number: data.contact.house_number || null,
        zip_code: data.contact.zip_code || null
      }
    };
  }

  public nullEmployee() {
    this.employeeData = {
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
  }
}
