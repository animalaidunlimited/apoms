import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';

@Injectable({ providedIn: 'root' })
export class UniqueEmergencyNumberValidator {
    constructor(private caseService: CaseService) {}

    validate(emergencyNumber: number, checkExists: number): AsyncValidatorFn {
        return (
            control: AbstractControl,
        ): Observable<any | null> => {
            // If the form hasn't been touched then don't validate
            if (control.pristine) {
                return of(null);
            }

            return this.caseService.checkEmergencyNumberExists(control.value, emergencyNumber).pipe(map((result:SuccessOnlyResponse) => {

                        // if emergency number is already taken
                        if (result.success === checkExists) {
                            return { emergencyNumberTaken: true };
                        }
                        else if (result.success === -1){
                            return { databaseError : true };
                        }
                        else
                        {
                            return null;
                        }
                    }),
                );
        };
    }
}
