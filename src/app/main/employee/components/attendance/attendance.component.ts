import { Component } from '@angular/core';

export interface DaySchedule {
  timeIn: Date;
  timeOut: Date;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent {

  employeeImage: string = '/assets/images/no image.png'; 
  employeeName: string = 'John Doe';
  employeePosition: string = 'Employee';
  timeIn: string = '8:30 AM'

  attendance: {
    monday: DaySchedule,
    tuesday: DaySchedule,
    wednesday: DaySchedule,
    thursday: DaySchedule,
    friday: DaySchedule,
    saturday: DaySchedule
  } = {
    monday: { timeIn: new Date('2024-09-11T08:00:00'), timeOut: new Date('2024-09-11T17:00:00') },
    tuesday: { timeIn: new Date('2024-09-12T08:00:00'), timeOut: new Date('2024-09-12T17:00:00') },
    wednesday: { timeIn: new Date('2024-09-13T08:00:00'), timeOut: new Date('2024-09-13T17:00:00') },
    thursday: { timeIn: new Date('2024-09-14T08:00:00'), timeOut: new Date('2024-09-14T17:00:00') },
    friday: { timeIn: new Date('2024-09-15T08:00:00'), timeOut: new Date('2024-09-15T17:00:00') },
    saturday: { timeIn: new Date('2024-09-16T08:00:00'), timeOut: new Date('2024-09-16T12:00:00') }
  };
}



