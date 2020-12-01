import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class PromptUpdateService {

  constructor(private swUpdate: SwUpdate, private snackbar: MatSnackBar) {
    
    this.swUpdate.available.subscribe(() => {

    const snack = this.snackbar.open('Update Available', 'Reload',{
      duration: 100000});

    snack
      .onAction()
      .subscribe(() => {
        window.location.reload();
      });


    });

  }


}

