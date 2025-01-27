import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  notifications: any = [];

  public get getNotificationsCount() {
    return this.notifications.length;
  }

  public setNotifications(data: any = []) {
    this.notifications = data;
  }
}
