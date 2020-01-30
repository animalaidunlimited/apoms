import { FormGroup, ValidatorFn, ValidationErrors, Validators, RequiredValidator } from "@angular/forms";

  export const emergencyCaseValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    
    const complainerName = control.get("complainerDetails.complainerName");
    const complainerNumber = control.get("complainerDetails.complainerNumber");
    const animalArea = control.get("locationDetails.animalArea");
    const animalLocation = control.get("locationDetails.animalLocation");

    complainerName.clearValidators();
    complainerNumber.clearValidators();
    animalArea.clearValidators();
    animalLocation.clearValidators();



    if((complainerName.value || complainerNumber.value) && !(complainerName.value && complainerNumber.value))
    {
      alert("Here 1");
      !!complainerName.value == true  ? complainerNumber.setValidators([Validators.required])
                              : complainerName.setValidators([Validators.required]); 
    }

    if((animalArea.value || animalLocation.value) && !(animalArea.value && animalLocation.value))
    {
      !!animalArea.value == true  ? animalLocation.setValidators([Validators.required])
                              : animalArea.setValidators([Validators.required]); 
    }


    return  null;
  };


