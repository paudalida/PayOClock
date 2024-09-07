import { Injectable } from '@angular/core';
import { Sweetalert2ModuleConfig } from '@sweetalert2/ngx-sweetalert2';
import Swal, { SweetAlertIcon, SweetAlertPosition } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor() { }

  get genericErrorTitle() {
    return 'Something went wrong!';
  }

  get genericErrorMessage() {
    return 'Help us improve your experience by sending an error report';
  }

  /* 
  ## USAGE

  -- Just call the services and apply params
  -- Some functions share params, just refer to the earlier documentation for usage
  -- For more detailed information about the params in sweetalert documentations

  ## Params
  
  **icon**: Icon for the popup (success, error, warning, question, info)
  **title**: Title of the popup, bigger font than the content. Make it precise and short
  **seconds**: Seconds for auto close popups like toast
  **position**: Position of the popup, mainly for toasts, e.g., top-end, top-start, center
  */

  toastWithTimer(icon: SweetAlertIcon, title: string, seconds: number = 2, position: SweetAlertPosition = 'top-end') {
    Swal.fire({
      toast: true,
      icon: icon,
      title: title,
      position: position,
      showConfirmButton: false,
      timer: seconds * 1000,
      timerProgressBar: true,
      customClass: {
        container: 'toast'
      }
    });
  }

  swalBasic(icon: SweetAlertIcon, title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      customClass: {
        confirmButton: 'btn-primary'
      },
      willOpen: () => {
        document.body.style.overflowY = 'scroll';
      },
      willClose: () => {
        document.body.style.overflowY = 'scroll';
      },
    });
  }

  /* 
  ## USAGE

  -- This function is async, use then for handling in ts

  ## SAMPLE USAGE

  this.pop.swalWithCancel( <insert params> )
    .then(isConfirmed => {
      if (isConfirmed) {
        < Handle the confirmation action >
      } else {
        < Handle the cancellation action >
      }
    });

  ## Params not mentioned above
  
  **confirmText**: Confirmation button text. Default is OK
  **cancelText**: Cancellation button text. Default is Cancel
  **reversed**: Boolean. Use false if you want the confirm to be on the left. True by default (confirm on right, cancel on left)
  */

  async swalWithCancel(icon: SweetAlertIcon, title: string, text?: string, 
                      confirmText: string = 'OK', cancelText: string = 'Cancel', 
                      reversed: boolean = true) {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      reverseButtons: reversed,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      customClass: {
        confirmButton: 'btn-primary'
      },
      willOpen: () => {
        document.body.style.overflowY = 'scroll';
      },
      willClose: () => {
        document.body.style.overflowY = 'scroll';
      },
    }).then((result) => {
      // Return a promise that resolves with true if confirmed, false otherwise
      return result.isConfirmed;
    });
  }

   /* 
  ## USAGE

  -- Same with 2 buttons, but you can use switch case or add an additional if statement.
  -- Results in 3 values of string ('confirmed', 'denied', 'canceled').
  -- Handle the results appropriately

  ## Params not mentioned above
  
  **choice1**: Choice 1, the primary color button. 
  **choice2**: Choice 2, the secondary choice. Deny in sweetalert, but you can input any choice, just handle the 'denied' string
  **cancelText**: Cancellation button text. Default is Cancel
  **reversed**: Boolean. Use false if you want the confirm to be on the left. True by default (confirm on right, cancel on left)
  */

  async swalWith3Buttons(icon: SweetAlertIcon, title: string, text: string, 
    choice1: string, choice2: string, cancelText: string = 'Cancel', 
    reversed: boolean = true) {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: choice1,
      denyButtonText: choice2,
      cancelButtonText: cancelText,
      reverseButtons: reversed,
      customClass: {
      confirmButton: 'btn-primary',
      denyButton: 'btn-danger'
    },
    willOpen: () => {
      document.body.style.overflowY = 'scroll';
    },
    willClose: () => {
    document.body.style.overflowY = 'scroll';
    },
  });

  if (result.isConfirmed) {
    return 'confirmed';
  } else if (result.isDenied) {
    return 'denied';
  } else {
    return 'canceled';
  }
  }
}

