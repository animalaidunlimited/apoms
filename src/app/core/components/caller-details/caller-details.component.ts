import { Component, OnInit, Input, OnDestroy, ViewChildren, HostListener } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { FormGroup, FormBuilder, AbstractControl, FormArray } from '@angular/forms';
import { Callers, Caller } from '../../models/responses';
import { CallerDetailsService } from './caller-details.service';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { SelectionModel } from '@angular/cdk/collections';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { QueryList } from '@angular/core';
import { CallerAutocompleteComponent } from '../caller-autocomplete/caller-autocomplete.component';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'caller-details',
    templateUrl: './caller-details.component.html',
    styleUrls: ['./caller-details.component.scss'],
})

export class CallerDetailsComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();

    @Input() recordForm!: FormGroup;
    @ViewChildren(CallerAutocompleteComponent) callerAutoComplete!: QueryList<CallerAutocompleteComponent>;

    caller$!: Caller;
    callerDetails!:FormGroup;
    callerArray!: FormArray;
    public callerAutoComplete$:any; // TODO: type this Observable<Callers>;

    callerNumber!:AbstractControl|null;

    errorMatcher = new CrossFieldErrorMatcher();
    selection = new SelectionModel<any>(false, []);

    @HostListener('document:keydown.meta.shift.n', ['$event'])
    setMacFocusNumber(event: KeyboardEvent){
        event.preventDefault();
        if(navigator.platform.match('Mac')){
            this.callerAutoComplete.last.callerNumberRef?.nativeElement.focus();
        }
    }


    constructor(
        private callerService: CallerDetailsService,
        private fb: FormBuilder,
        private snackbar: SnackbarService,
    ) {}



    @HostListener('document:keydown.alt.shift.n', ['$event'])
    setFocusNumber(event: KeyboardEvent) {
        event.preventDefault();
        this.callerAutoComplete.last.callerNumberRef?.nativeElement.focus();
    }


    ngOnInit() {

        this.recordForm.addControl(
            'callerDetails',
            this.fb.group({
                callerArray: this.fb.array([this.callerService.getCallerFormGroup()])
            })
        );

        this.callerDetails = this.recordForm.get('callerDetails') as FormGroup;

        this.callerArray = this.callerDetails.get('callerArray') as FormArray;


        this.callerArray.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((callers:Caller[]) => {

            const empty = callers.every(caller => Object.values(caller).every(value => value=== null));

            if(empty && this.callerArray.pristine && callers.length >= 1){
                // We've reset, so empty the array and repopulate, and make sure we set the primary again
                this.callerArray.clear();
                this.callerArray.push(this.callerService.getCallerFormGroup());
                this.callerArray.at(0).get('primaryCaller')?.setValue(true);
            }

        });

        if(this.callerArray.length === 1) {
            this.callerArray.at(0).get('primaryCaller')?.setValue(true);
        }

        this.callerService.getCallerByEmergencyCaseId(this.recordForm.get('emergencyDetails.emergencyCaseId')?.value)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((caller: Callers) => {
                for(let i=0 ; i< caller.length - 1 ; i++) {
                    this.callerArray.push(this.callerService.getCallerFormGroup());
                }
                this.callerArray.patchValue(caller);
            });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }




    addCaller(event: Event) {
        this.callerArray.push(this.callerService.getCallerFormGroup());
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


