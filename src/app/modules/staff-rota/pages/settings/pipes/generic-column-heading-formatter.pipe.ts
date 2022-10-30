import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatHeading'
})
export class GenericColumnHeadingFormatterPipe implements PipeTransform {

  transform(value: string, args?: any): any {
    return value.replace(/[A-Z]/g, ' $&').trim().toLowerCase();
  }

  

}
