import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { RotaService } from 'src/app/modules/staff-rota/services/rota.service';

interface DateCheckResponse{
    success: number;
}

@Injectable({ providedIn: 'root' })
export class RotationPeriodValidator {
    
    constructor(private rotaService: RotaService) {}

    public checkDateNotInExistingRange(currentId: string, currentArray: FormArray): AsyncValidatorFn {
        return (
            control: AbstractControl,
        ): Observable<any | null> => {

            if(!control.value){
                return  of(null);
            }
            else
            {

                //first let's check if the date exists in another range in the current array
                for(let current of currentArray?.controls){

                    if(currentId !== current.get('rotationPeriodGUID')?.value &&
                        this.checkDateInRange(
                            new Date(control.value),
                            new Date(current.get('startDate')?.value),
                            new Date(current.get('endDate')?.value)))
                            {

                        return of({ dateExistsInRange: true });                                              

                    }
                }

                //Now let's check if the date exists in the database
                return this.rotaService.checkDateNotInRange(control.value)
                .pipe(
                    map((response:DateCheckResponse) => {

                        if (response) {
                            // if tag number is already taken
                            if (response.success === 1) {
                                return { dateExistsInRange: true };
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

    private checkDateInRange(checkDate: Date, startDate: Date, endDate: Date): boolean {

        if(checkDate >= startDate && checkDate <= endDate){
            return true
        };

        return false;

    }
}
