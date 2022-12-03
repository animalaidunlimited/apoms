import { ValidatorFn, AbstractControl } from "@angular/forms";

export function maxDateTodayValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {

      const today = new Date().getTime();

      const dateToCheck = new Date(control.value);
  
      if(!(control && control.value)) {
        // if there's no control or no value, that's ok
        return null;
      }      
  
      // return null if there's no errors
      return dateToCheck.getTime() > today 
        ? {invalidDate: 'Date must be today or before' } 
        : null;
    }
  }

  export function minDateValidator(minDate: Date): ValidatorFn {    

    return (control: AbstractControl): {[key: string]: any} | null => {     

      const dateToCheck = new Date(control.value);
  
      if(!(control && control.value)) {
        // if there's no control or no value, that's ok
        return null;
      }
        
      // return null if there's no errors
      return dateToCheck.getTime() < minDate.getTime()
        ? {invalidDate_Min: 'Date must be after input date' } 
        : null;
    }
  }

  export function maxDateValidator(maxDate: Date): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {

      const dateToCheck = new Date(control.value);
  
      if(!(control && control.value)) {
        // if there's no control or no value, that's ok
        return null;
      }

      // return null if there's no errors
      return dateToCheck.getTime() > maxDate.getTime() 
        ? {invalidDate_Max: 'Date must be before input date' } 
        : null;
    }
  }