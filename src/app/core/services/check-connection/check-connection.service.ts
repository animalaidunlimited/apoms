import { Injectable } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { takeUntil, switchMap, retryWhen, tap, delay, take } from 'rxjs/operators';
import { OnlineStatusService } from '../online-status/online-status.service';

@Injectable({
  providedIn: 'root'
})
export class CheckConnectionService {

  public ngUnsubscribe = new Subject();

  public connectionStateSubs = new Subject();

  checkConnection!:Observable<boolean>;

  constructor(private onlineStatus: OnlineStatusService,) { 

    this.checkConnection = timer(0,3000).pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap(() => this.onlineStatus.connectionChanged),
      takeUntil(this.ngUnsubscribe),
      retryWhen(errors =>
        errors.pipe(
          // log error message
          tap(error => console.log(error)),
          // restart after 5 mins
          delay(5000)
        )
      )
    );

  }
}
