import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Injector, OnDestroy, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  pure: false
})
export class TimeAgoPipe implements PipeTransform, OnDestroy {


  private asyncPipe: AsyncPipe;

  constructor(private injector: Injector) {
    this.asyncPipe = new AsyncPipe(injector.get(ChangeDetectorRef));
  }

  ngOnDestroy() {
     this.asyncPipe.ngOnDestroy();
  }


  transform(value: string, ...args: string[]): string {
    let result = '';
    if (value) {
      // current time
      const currentTime = new Date().getTime();
      const delta = (currentTime - new Date(value).getTime()) / 1000;

      if (delta < 10) {
        result = 'now';
      } else if (delta < 60) { // sent in last minute
        result = Math.floor(delta) + ' Seconds';
      } else if (delta < 3600) { // sent in last hour
        result = Math.floor(delta / 60) + ' Minutes';
      } else if (delta < 86400) { // sent on last day
        result = Math.floor(delta / 3600) + ' Hours';
      } else { // sent more than one day ago
        result = Math.floor(delta / 86400) + ' Days';
      }
      
    }
    return result;
  }

}
