import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';

@Injectable({ providedIn: 'root' })
export class UniqueTagNumberValidator {
    constructor(private patientService: PatientService) {}

    validate(emergencyCaseId: number, patientId: AbstractControl): AsyncValidatorFn {
        return (
            control: AbstractControl,
        ): Observable<any | null> => {

            if(!control.value){

                return new Observable((observer) => {

                    observer.next(null);

                });

            }
            else
            {
                return this.patientService
                .checkTagNumberExists(control.value, emergencyCaseId, patientId.value)
                .pipe(
                    map((res:any) => {
                        if (res) {
                            // if tag number is already taken
                            if (res[0]['@success'] === '1') {
                                // return error
                                return { tagNumberTaken: true };
                            }
                            else{
                                return null;
                            }

                        }
                        else{
                            return null;
                        }
                    }),
                );

            }




        };
    }
}
