import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { PatientService } from 'src/app/core/services/patient/patient.service';

@Injectable({ providedIn: 'root' })
export class UniqueTagNumberValidator {
    constructor(private patientService: PatientService) {}

    validate(emergencyCaseId: number, patientId: AbstractControl): AsyncValidatorFn {
        return (
            control: AbstractControl,
        ): Observable<any | null> => {

            if(!control.value){
                return  of(null);
            }
            else
            {
                return this.patientService
                .checkTagNumberExists(control.value, emergencyCaseId, patientId.value)
                .pipe(
                    map((res:any) => {

                        if (res) {                            

                            // if tag number is already taken
                            if (res.success === 1) {
                                return { tagNumberTaken: true };
                            }
                            else{
                                return null;
                            }

                        }
                        else{
                            return null;
                        }
                    })
                );

            }




        };
    }
}
