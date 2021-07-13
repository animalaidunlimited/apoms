import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

import { isBlank, isPresent } from '../components/patient-visit-details/utils';

export class UniqueValidators {

	public static uniqueBy = (field: string): ValidatorFn => {
		return (formArrayControl: AbstractControl): ({ [key: string]: boolean} | null)=> {
			const formArray = formArrayControl as FormArray;
			const controls: AbstractControl[] = formArray.controls.filter(formGroup => {
				return isPresent(formGroup.get(field)?.value);
			});
			const uniqueObj: ValidationErrors = { uniqueBy: true };
			let find  = false;

			controls.map(formGroup => formGroup.get(field)).forEach(x => {
				if (x?.errors) {
					delete x.errors.uniqueBy;
					if (isBlank(x.errors)) {
						x.setErrors(null);
					}
				}
			});

			if (controls.length > 1) {
				for (let i = 0; i < controls.length; i++) {
					const formGroup: FormGroup = controls[i] as FormGroup;
					const mainControl = formGroup.get(field);
					const val: string = mainControl?.value;
					const mainValue: string = val;
					controls.forEach((group, index: number) => {
						if (i === index) {
							return;
						}

						const currControl: any = group.get(field);
						const tempValue: string = currControl.value;
						const currValue: string = tempValue ;
						let newErrors: any;

						if (mainValue === currValue) {
							if (isBlank(currControl.errors)) {
								newErrors = uniqueObj;
							} else {
								newErrors = Object.assign(currControl.errors, uniqueObj);
							}
							currControl.setErrors(newErrors);
							find = true;
						}
					});
				}

				if (find) {
					return uniqueObj;
				}
			}

			return null;
		};
	}
}
