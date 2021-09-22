import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PromptUpdateService {
  private ngUnsubscribe = new Subject();

  constructor(private swUpdate: SwUpdate, private snackbar: MatSnackBar) {
    
    this.swUpdate.available.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {

    const snack = this.snackbar.open('Update Available', 'Reload',{
      duration: 100000});

    snack
      .onAction().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        window.location.reload();
      });


    });

  }


}

