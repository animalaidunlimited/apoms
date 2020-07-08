import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserOptionsService } from "src/app/core/services/user-options.service";
@Injectable({
  providedIn: 'root'
})
export class SnackbarService{
  notificationDurationSeconds: number;

  constructor(public snackBar: MatSnackBar , public userOptions:UserOptionsService, private zone: NgZone) { this.init()}

  init(){

    this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

  }

  successSnackBar(message: string , action: string){
    this.zone.run(() => {

      this.snackBar.open(message , action , {
        duration: this.notificationDurationSeconds * 1000,
        panelClass:'notif-success'
      }) ;

    });

  }

  errorSnackBar(message: string , action: string){

    this.zone.run(() => {

      this.snackBar.open(message , action , {
        duration: this.notificationDurationSeconds * 1000,
        panelClass:'notif-error'
      }) ;
    });

  }

}
