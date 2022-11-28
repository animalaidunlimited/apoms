
import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatLegacyAutocomplete as MatAutocomplete } from '@angular/material/legacy-autocomplete';
import { MatLegacyChipList as MatChipList } from '@angular/material/legacy-chips';
import { MatLegacyTable as MatTable, MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Patient, Patients } from 'src/app/core/models/patients';
import { Exclusions } from 'src/app/core/models/responses';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { UniqueTagNumberValidator } from 'src/app/core/validators/tag-number.validator';
import { EmergencyRegisterPatientComponent } from '../emergency-register-patient/emergency-register-patient.component';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { TreatmentArea } from 'src/app/core/models/treatment-lists';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { MatDialog } from '@angular/material/dialog';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { generateUUID } from 'src/app/core/helpers/utils';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'animal-selection',
    templateUrl: './animal-selection.component.html',
    styleUrls: ['./animal-selection.component.scss'],
})
export class AnimalSelectionComponent implements OnInit, OnDestroy{

    constructor(
        private fb: UntypedFormBuilder,
        private patientService: PatientService,
        private tagNumberValidator: UniqueTagNumberValidator,
        private cdr: ChangeDetectorRef,
        private printService: PrintTemplateService,
        private userOptions: UserOptionsService,
        private dialog: MatDialog,
        private dropdown: DropdownService,
    ) {}

    private ngUnsubscribe = new Subject();


    @Input() recordForm!: FormGroup;
    @Input() incomingPatientArray!: Patient[];
    @Input() isDisplayOnly!: boolean;

    @Input() outcome!:boolean;
    @ViewChild(MatTable, { static: true }) patientTable!: MatTable<any>;
    @ViewChild('problemChips', { static: true }) problemChips!: MatChipList;
    @ViewChild('addPatientBtn', {static: true}) addPatientBtn!: ElementRef;

    @ViewChild('auto') matAutocomplete!: MatAutocomplete;

    @Output() problemTabPressed:EventEmitter<boolean> = new EventEmitter();

    @ViewChild('problemsAutoOptions') problemsAutoOptions!: ElementRef;

    @ViewChildren(EmergencyRegisterPatientComponent) emergencyRegisterPatients!: QueryList<EmergencyRegisterPatientComponent>;

    currentPatientSpecies: string | undefined;
    emergencyCaseId: number | undefined;
    exclusions: Exclusions[] = [] as Exclusions[];

    problemsExclusions!: string[];

    selectedProblems:string[] = [];

    patients!:FormArray;

    form = new FormGroup({});

    patientDataSource: MatTableDataSource<FormGroup> = new MatTableDataSource([this.form]);

    selection: SelectionModel<FormGroup> = new SelectionModel<FormGroup>(true, []);

    validRow = true;

    emergencyCardHTML = '';

    errorMatcher = new CrossFieldErrorMatcher();

    treatmentAreaNames$!: Observable<TreatmentArea[]>;

    @HostListener('document:keydown.control.p', ['$event'])
    addPatientTable(event: KeyboardEvent) {
        event.preventDefault();
        if(this.outcome){
            return;
        }
        this.addPatientRow();
        this.cdr.detectChanges();


        const insertedPatientIndex = this.emergencyRegisterPatients.toArray().length - 1;
        this.emergencyRegisterPatients.toArray()[insertedPatientIndex - 1].animalAutoComplete.closePanel();
        this.emergencyRegisterPatients.toArray()[insertedPatientIndex].animalTypeInput.nativeElement.focus();
    }


    @HostListener('document:keydown.control.enter', ['$event'])
    catchControlEnter(event: KeyboardEvent) {
        event.preventDefault();
        if(this.outcome)
        {
            this.emergencyRegisterPatients.first.tagNumber?.nativeElement.focus();
        }
    }


    ngOnInit() {

        this.treatmentAreaNames$ = this.dropdown.getTreatmentAreas();

        this.recordForm.addControl('patients', this.fb.array([]));

        this.patients = this.recordForm.get('patients') as FormArray;


        this.emergencyCaseId = this.recordForm.get('emergencyDetails.emergencyCaseId')?.value || null;

        this.recordForm.get('emergencyDetails.emergencyCaseId')?.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        // tslint:disable-next-line: deprecation
        .subscribe(newValue => this.emergencyCaseId = newValue);


        this.emergencyCaseId || this.incomingPatientArray.length > 0
        ? this.loadPatientArray(this.emergencyCaseId)
        : this.initPatientArray();

        // If we are updating the ER record then the patients array will be empty in the ngoninit so we will only pass the patients array if it has length
        // and it will have length only when we are adding a new case.
        if(this.patients.controls.length) {
            this.setChildOutcomeAsParentPatient(this.patients);
        }


    }

    problemTab($event:boolean){
        this.problemTabPressed.emit($event);
    }

    addPatientRow(){
        const patient = this.getEmptyPatient();
        if(this.patients.at(0).get('callOutcome.CallOutcome')?.value?.CallOutcomeId === 1){
            patient.get('callOutcome.CallOutcome')?.setValue({
                CallOutcomeId : 1,
                CallOutcome: 'Admission'
            }, {emitEvent: false});
        }

        this.patients.push(patient);
    }


    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }


    getEmptyPatient() {

        const patient =
            this.fb.group({
                patientId: [],
                GUID: [generateUUID()],
                animalTypeId: ['', Validators.required],
                animalType: ['', Validators.required],
                problems: this.fb.array([]),
                tagNumber: [''],
                duplicateTag: [false, Validators.required],
                updated: [false, Validators.required],
                deleted: [false, Validators.required],
                isAdmission:[false],
                admissionArea: [],
                admissionAccepted: [false],
                callOutcome: this.fb.group({
                    CallOutcome: [],
                    sameAsNumber: []
                }),
            });

            this.setValidators(patient);

        return patient;
    }

    // TODO fix any issues with the update flag here.
    // We'll need to make sure we're only updating patients that we need to update
    // and not just deleting them all and recreating.
    populatePatient(isUpdate: boolean, patient: Patient) : FormGroup {

        const problems = this.fb.array([]);

        patient.problems.forEach(() => {

            problems.push(this.fb.group({
                problemId: [],
                problem: [],
            }));

        });

        const newPatient = this.getPatient(problems);        

        newPatient.patchValue(patient);

        this.setValidators(newPatient);

        if(newPatient.get('admissionAccepted')?.value){
            newPatient.get('admissionArea')?.disable();
        }

        return newPatient;

    }

    getPatient(problems: FormArray) : FormGroup {

        const newPatient = this.fb.group({
            patientId: [],
            GUID: [],
            animalTypeId: ['', Validators.required],
            animalType: ['', Validators.required],
            problems,
            tagNumber: [''],
            duplicateTag: [false, Validators.required],
            updated: [, Validators.required],
            deleted: [false, Validators.required],
            isAdmission: [],
            admissionAccepted: [],
            admissionArea: [],
            callOutcome: this.fb.group({
                CallOutcome: [],
                sameAsNumber: []
            }),
        });

        return newPatient;
    }

    setValidators(patient: FormGroup) {

        const patientIdControl = patient?.get('patientId');

        patient.get('tagNumber')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(tagVal=> {

            if(tagVal && patientIdControl) {

                patient.get('tagNumber')?.setAsyncValidators(this.tagNumberValidator.validate(
                    this.emergencyCaseId || -1,
                    patientIdControl,
                ));                
                
            }

        });


        patient.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((patientVal)=> {

            const controls = [
                                { updateIfSelfAdmission: false, controlName: 'rescueDetails.rescueTime'},
                                { updateIfSelfAdmission: false, controlName: 'rescueDetails.assignedVehicleId'},
                                { updateIfSelfAdmission: false, controlName: 'rescueDetails.ambulanceArrivalTime'},
                                { updateIfSelfAdmission: false, controlName: 'rescueDetails.ambulanceAssignmentTime'},
                                { updateIfSelfAdmission: true, controlName: 'rescueDetails.admissionTime'},
                                { updateIfSelfAdmission: true, controlName: 'rescueDetails.code'}
                             ];

            const selfAdmission:boolean = this.recordForm.get('rescueDetails.selfAdmission')?.value || false;

                for(let currentControl of controls){

                    const control = this.recordForm.get(currentControl.controlName);

                    patientVal.callOutcome.CallOutcome?.CallOutcomeId === 1 && (!selfAdmission || (selfAdmission && currentControl.updateIfSelfAdmission)) ?
                        this.setRequired(control) :
                        this.clearValidators(control);
                }

        });

    }

    private setRequired(control: AbstractControl | null) : void {

        control?.setValidators([Validators.required]);
        control?.updateValueAndValidity({ emitEvent: false });

    }

    private clearValidators(control: AbstractControl | null) : void {

        control?.clearValidators();
        control?.updateValueAndValidity({ emitEvent: false });

    }

    loadPatientArray(emergencyCaseId: number | undefined) {


        if(this.incomingPatientArray?.length > 0) {

            this.incomingPatientArray.forEach(patient=> {
                patient.deleted = !!+patient.deleted;

                const newPatient = this.populatePatient(true, patient);
                /*
                * loadPatientArray running multiple times on ngOnInit
                * animal-selection HTML tag will instantiate ng on init
                * Restrict length of patients array to length of incoming patients
                */
                if(this.patients.length < this.incomingPatientArray.length )
                {
                    this.patients.push(newPatient);
                }
            });

            this.setChildOutcomeAsParentPatient(this.patients);

        }
        else if(emergencyCaseId) {

            this.patientService.getPatientsByEmergencyCaseId(emergencyCaseId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((patients: Patients) => {

                patients.patients.forEach(patient => {
                    // We get a 0 or 1 from the database, so need to convert to a boolean.
                    patient.deleted = !!+patient.deleted;

                     const newPatient = this.populatePatient(true, patient);
                    /*
                    * loadPatientArray running multiple times on ngOnInit
                    * animal-selection HTML tag will instantiate ng on init
                    * Restrict length of patients array to length of incoming patients
                    */
                    if(this.patients.length < patients.patients.length )
                    {
                        this.patients.push(newPatient);
                    }
                });

                this.setChildOutcomeAsParentPatient(this.patients);

            },
                err => console.error(err),
            );
        }

    }


    initPatientArray() {

        this.patients.clear();

        const patient = this.getEmptyPatient();

        this.patients.push(patient);

    }
    /**
     * Same as inside call outcome value changes
     *  it is used for when fetching the data from api
     * if api has call outcome admission because valueChanges will not run inside call outcome component on
     * ngOnIt
     */
    setChildOutcomeAsParentPatient(patients: FormArray) : void {

        patients.controls[0].valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val=> {

            if(val.callOutcome.CallOutcome) {

                if(val.callOutcome.CallOutcome.CallOutcomeId === 1 && !val.admissionArea) {

                    patients.controls.forEach((patient)=> {
                        if(isNaN(patient.get('callOutcome.CallOutcome')?.value?.CallOutcomeId)){
                            patient.get('callOutcome.CallOutcome')?.setValue({
                                CallOutcomeId : val.callOutcome.CallOutcome.CallOutcomeId,
                                CallOutcome: val.callOutcome.CallOutcome.CallOutcome
                            }, {emitEvent: false});

                            patient.get('isAdmission')?.setValue(true, {emitEvent: false});
                            patient.get('isAdmission')?.updateValueAndValidity({ emitEvent: false });

                            patient.get('tagNumber')?.setValidators([Validators.required, Validators.pattern(/^[A-z0-9]*$/)]);
                            patient.get('tagNumber')?.updateValueAndValidity({ emitEvent: false });

                            patient.get('admissionArea')?.setValidators(Validators.required);
                            patient.get('admissionArea')?.updateValueAndValidity({ emitEvent: false });
                        }
                    });

                }

                else if(val.callOutcome.CallOutcome.CallOutcomeId === 1 && val.admissionArea){

                    patients.controls.forEach(patient=> {
                        patient.get('admissionArea')?.setValue(val.admissionArea, { emitEvent: false });
                    });

                }

            }

            });

    }
    openMediaDialog(patientForm:FormGroup | AbstractControl){
        // this is never going to work where is MediaItem and even typescript take it as mediaItem idiot their is no mediaItem
        const dialogRef = this.dialog.open(MediaDialogComponent, {
          minWidth: '50%',
          data: {
              tagNumber: patientForm.get('tagNumber')?.value,
              patientId: patientForm.get('patientId')?.value,
              mediaItem: undefined
          }
        });
      }

      printEmergencyCard(patientForm:FormGroup | AbstractControl){

        const printTemplateId = this.userOptions.getEmergencyCardTemplateId();

        if(patientForm.get('patientId')?.value){
          this.printService.printPatientDocument(printTemplateId, patientForm.get('patientId')?.value);
        }

      }

      deletePatient($event:number){

        const patientIndex = this.patients.controls.findIndex(patient => (patient.get('index')?.value || -1) === $event)
        this.patients.removeAt(patientIndex);

      }

}