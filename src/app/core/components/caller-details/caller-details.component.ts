import { Component, OnInit, Input } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import {
    FormGroup,
    Validators,
    FormBuilder,
    AbstractControl,
    FormArray,
} from '@angular/forms';
import { Callers, Caller } from '../../models/responses';
import { CallerDetailsService } from './caller-details.service';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'caller-details',
    templateUrl: './caller-details.component.html',
    styleUrls: ['./caller-details.component.scss'],
})
export class CallerDetailsComponent implements OnInit {
    @Input() recordForm!: FormGroup;

    errorMatcher = new CrossFieldErrorMatcher();

    callerArray!: FormArray;

    selection = new SelectionModel<any>(false, []);

    public callerAutoComplete$:any; // TODO: type this Observable<Callers>;

    callerDetails!:FormGroup;

    callerNumber!:AbstractControl|null;
    caller$!: Caller;

    constructor(
        private callerService: CallerDetailsService,
        private fb: FormBuilder,
        private snackbar: SnackbarService,
    ) {}

    ngOnInit() {

        this.recordForm.addControl(
            'callerDetails',
            this.fb.group({
                callerArray: this.fb.array([this.getCallerFormGroup()])
            })
        );

        this.callerDetails = this.recordForm.get('callerDetails') as FormGroup;

        this.callerArray = this.callerDetails.get('callerArray') as FormArray;


        this.callerArray.valueChanges.subscribe((callers:Caller[]) => {

            const empty = callers.every(caller => Object.values(caller).every(value => value=== null));

            if(empty && this.callerArray.pristine && callers.length >= 1){
                // We've reset, so empty the array and repopulate, and make sure we set the primary again
                this.callerArray.clear();
                this.callerArray.push(this.getCallerFormGroup());
                this.callerArray.at(0).get('primaryCaller')?.setValue(true);
            }

        });

        if(this.callerArray.length === 1) {
            this.callerArray.at(0).get('primaryCaller')?.setValue(true);
        }

        this.callerService.getCallerByEmergencyCaseId(this.recordForm.get('emergencyDetails.emergencyCaseId')?.value)
            .subscribe((caller: Callers) => {
                for(let i=0 ; i< caller.length - 1 ; i++) {
                    this.callerArray.push(this.getCallerFormGroup());
                }
                this.callerArray.patchValue(caller);
            });
    }


    getCallerFormGroup(): FormGroup {
        return this.fb.group({
            callerId: [],
            callerName: ['', Validators.required],
            callerNumber: [
                '',
                [
                    Validators.required,
                    Validators.pattern(
                        '^[+]?[\\d\\s](?!.* {2})[ \\d]{2,15}$',
                    ),
                ],
            ],
            callerAlternativeNumber: [
                '',
                Validators.pattern('^[+]?[\\d\\s](?!.* {2})[ \\d]{2,15}$'),
            ],
            primaryCaller: []
        });
    }

    addCaller(event: Event) {
        this.callerArray.push(this.getCallerFormGroup());
    }

    removeCaller(callerIndex: number) {

        if(this.callerArray.length > 1) {

            this.callerArray.removeAt(callerIndex);

            this.callerArray.length === 1 ?
            this.callerArray.at(0).get('primaryCaller')?.setValue(true) :
            this.autoSetPrimaryToFirst();

        }
        else {
            this.snackbar.errorSnackBar('Invalid action','OK');
        }
    }

    primaryCaller(callerIndex: number) {
        this.callerArray.controls.forEach((element,index)=>{
            if(index !== callerIndex) {
                element.get('primaryCaller')?.setValue(false);
            }
         });

         this.autoSetPrimaryToFirst();
    }

    autoSetPrimaryToFirst() {
        const trueValueCount = this.callerArray.controls.some(value=> value.get('primaryCaller')?.value === true);
        if(!trueValueCount) {
            this.callerArray.at(0).get('primaryCaller')?.setValue(true);

        }
    }

}
