import { ValidatorFn, AbstractControl } from "@angular/forms";

export function dateValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {

      const today = new Date().getTime();

      const dateToCheck = new Date(control.value);
  
      if(!(control && control.value)) {
        // if there's no control or no value, that's ok
        return null;
      }
  
      // return null if there's no errors
      return dateToCheck.getTime() > today 
        ? {invalidDate: 'You cannot use future dates' } 
        : null;
    }
  }