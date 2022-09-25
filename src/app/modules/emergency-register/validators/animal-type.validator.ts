import { ValidatorFn, AbstractControl } from "@angular/forms";
import { AnimalType } from "src/app/core/models/animal-type";

export function animalTypeValidator(animalTypes: AnimalType[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {

      const index = animalTypes.findIndex(animalType=> animalType.AnimalType === control.value);

      return index < 0 ? { 'animalTypeMissing': { value: control.value } } : null;
    };
  }