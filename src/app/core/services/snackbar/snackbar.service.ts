import { Injectable, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
import { UserOptionsService } from "src/app/core/services/user-options.service";
@Injectable({
  providedIn: 'root'
})
export class SnackbarService implements OnInit{
  notificationDurationSeconds: number;

  constructor(public snackBar: MatSnackBar , public userOptions:UserOptionsService) { }

  ngOnInit(){
    this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();
  }

  successSnackBar(message: string , action: string){
    
    this.snackBar.open(message , action , {
      duration: 1000 ,
      panelClass:'notif-success'
    }) ;
  }

  errorSnackBar(message: string , action: string){
    this.snackBar.open(message , action , {
      duration: 1000 ,
      panelClass:'notif-error'
    }) ;
  }
  
}
