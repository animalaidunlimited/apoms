import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatGenericCell'
})
export class GenericColumnCellPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    
    
    let result = this.checkIfValueIsColour(value, args);
    
    result = this.checkIfValueIs_IsDeleted(result, args);

    result = this.checkIfValueIsTime(result, args);

    return result;
  }

  checkIfValueIsColour(value: string, args?: any) : string {

    return args === 'colour' ? '' : value;
  }

  checkIfValueIs_IsDeleted(value: string, args?: any) : string {

    if(args === 'isDeleted' && typeof value === 'number'){
      value = value === 0 ? 'No' : 'Yes'
    }

    return value;
  }

  checkIfValueIsTime(value: string, args?: any) : string {

    if(typeof value === 'string'){
      let pattern = /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d).([0-9]{5}\d)/;
      value = pattern.test(value) ? value.substring(0,5) : value;
    }

    return value;

  }

}
