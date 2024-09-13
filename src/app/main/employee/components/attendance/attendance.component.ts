import { Component } from '@angular/core';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent {

  employeeImage: string = '/assets/images/no image.png'; 
  employeeName: string = 'John Doe';
  employeePosition: string = 'Software Engineer';
  timeIn: Date = new Date(); 
}
