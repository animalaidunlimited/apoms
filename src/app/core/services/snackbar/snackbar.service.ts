import { Injectable, NgZone } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';

@Injectable({
    providedIn: 'root',
})

export class SnackbarService{
  notificationDurationSeconds = 3;

  constructor(public snackBar: MatSnackBar , public userOptions:UserOptionsService, private zone: NgZone) { this.init();}

  init(){
    this.notificationDurationSeconds = this.userOptions.getNotificationDuration();
  }

  successSnackBar(message: string , action: string){

    this.displaySnackbar(message, action, 'notif-success');

  }

  errorSnackBar(message: string, action: string){

    this.displaySnackbar(message, action, 'notif-error');

  }

  warningSnackBar(message: string, action: string){

    this.displaySnackbar(message, action, 'notif-warning');

  }

  displaySnackbar(message: string, action: string, panelClass: string){

    this.zone.run(() => {

      this.snackBar.open(message , action , {
        duration: this.notificationDurationSeconds * 1000,
        panelClass
      }) ;
    });

  }

  //displaySnackbar(message: string, action: string, class: string) {



}
