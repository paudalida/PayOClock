import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertPosition } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor() { }

  positionedWithTimer(icon: SweetAlertIcon, title: string, time: number = 1500, position: SweetAlertPosition = 'top-end') {
    Swal.fire({
      position: position,
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: time
    });
  }
}
