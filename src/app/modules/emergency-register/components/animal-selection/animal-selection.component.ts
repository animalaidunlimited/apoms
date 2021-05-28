
import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipList } from '@angular/material/chips';
import { MatTable, MatTableDataSource } from '@angular/material/table';
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

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'animal-selection',
    templateUrl: './animal-selection.component.html',
    styleUrls: ['./animal-selection.component.scss'],
})
export class AnimalSelectionComponent implements OnInit,OnDestroy{

    constructor(
        private fb: FormBuilder,
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
    @ViewChild(MatTable, { static: true }) patientTable!: MatTable<any>;
    @ViewChild('problemChips', { static: true }) problemChips!: MatChipList;
    @ViewChild('addPatientBtn', {static: true}) addPatientBtn!: ElementRef;

    @ViewChild('auto') matAutocomplete!: MatAutocomplete;



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
    tagNumber: string | undefined;
    validRow = true;

    emergencyCardHTML = '';

    errorMatcher = new CrossFieldErrorMatcher();
    
    treatmentAreaNames$!: Observable<TreatmentArea[]>;

    @HostListener('document:keydown.control.p', ['$event'])
    addPatientTable(event: KeyboardEvent) {
        event.preventDefault();
        this.addPatientRow();
        this.cdr.detectChanges();

        const insertedPatientIndex = this.emergencyRegisterPatients.toArray().length - 1;
        this.emergencyRegisterPatients.toArray()[insertedPatientIndex - 1].animalAutoComplete.closePanel();
        this.emergencyRegisterPatients.toArray()[insertedPatientIndex].animalTypeInput.nativeElement.focus();
    }


    @HostListener('document:keydown.control.enter', ['$event'])
    catchControlEnter(event: KeyboardEvent) {
        event.preventDefault();
            this.emergencyRegisterPatients.first.tagNumber.nativeElement.focus();
    }

    ngOnInit() {

        this.treatmentAreaNames$ = this.dropdown.getTreatmentAreas();

        this.recordForm.addControl('patients', this.fb.array([]));

        this.patients = this.recordForm.get('patients') as FormArray;

        this.emergencyCaseId = this.recordForm.get('emergencyDetails.emergencyCaseId')?.value;

        this.recordForm.get('emergencyDetails.emergencyCaseId')?.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        // tslint:disable-next-line: deprecation
        .subscribe(newValue => this.emergencyCaseId = newValue);

        this.emergencyCaseId
        ? this.loadPatientArray(this.emergencyCaseId)
        : this.initPatientArray();

        // If we are updating the ER record then the patients array will be empty in the ngoninit so we will only pass the patients array if it has length
        // and it will have length only when we are adding a new case.
        if(this.patients.controls.length) {
            this.setChildOutcomeAsParentPatient(this.patients);
        }



    }



    deletePatient(patientIndex:number) {

        this.patients.removeAt(patientIndex);
    }
    deleteCallOutcome(event: Event, patientIndex: number){

    }

    addPatientRow(){
        const patient = this.getEmptyPatient();
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
                position: [this.patients?.length ? this.patients.length + 1: 1],
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
    populatePatient(isUpdate: boolean, patient: Patient) {

        const problems = this.fb.array([]);

        patient.problems.forEach(() => {

            problems.push(this.fb.group({
                problemId: [],
                problem: [],
            }));
        });

        const newPatient = this.getPatient(
            problems
        );

        newPatient.patchValue(patient);

        if(newPatient.get('admissionAccepted')?.value){
            newPatient.get('admissionArea')?.disable();
        }

        return newPatient;

    }

        getPatient(problems: FormArray) : FormGroup {

        const newPatient = this.fb.group({
            patientId: [],
            position: [],
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

        this.setValidators(newPatient);

        return newPatient;
    }

    setValidators(patient: FormGroup) {

        const patientIdControl = patient?.get('patientId');

        patient.get('tagNumber')?.valueChanges.subscribe(tagVal=> {

            if(tagVal && patientIdControl) {
                patient.get('tagNumber')?.setAsyncValidators(this.tagNumberValidator.validate(
                    this.emergencyCaseId || -1,
                    patientIdControl,
                ));
            }

        });

        patient.valueChanges.subscribe((patientVal)=> {

            const rescuer1Id = this.recordForm.get('rescueDetails.rescuer1Id');
            const rescuer2Id = this.recordForm.get('rescueDetails.rescuer2Id');
            const rescueTime = this.recordForm.get('rescueDetails.rescueTime');
            const admissionTime = this.recordForm.get('rescueDetails.admissionTime');

                if(patientVal.callOutcome.CallOutcome?.CallOutcomeId === 1) {

                    patient.get('isAdmission')?.setValue(true,{ emitEvent: false });
                    patient.get('tagNumber')?.setValidators(Validators.required);
                    patient.get('admissionArea')?.setValidators(Validators.required);

                    rescuer2Id?.setValidators([Validators.required]);
                    rescuer1Id?.setValidators([Validators.required]);
                    rescueTime?.setValidators([Validators.required]);
                    admissionTime?.setValidators([Validators.required]);

                    this.updateValueAndValidity(patient, rescuer2Id, rescuer1Id, rescueTime, admissionTime);

                }

                else {

                    patient.get('admissionArea')?.setValue(null, {emitEvent:false});
                    patient.get('isAdmission')?.setValue(false, { emitEvent: false });
                    patient.get('tagNumber')?.clearValidators();
                    patient.get('admissionArea')?.clearValidators();

                    rescuer2Id?.clearValidators();
                    rescuer1Id?.clearValidators();
                    rescueTime?.clearValidators();
                    admissionTime?.clearValidators();

                    this.updateValueAndValidity(patient, rescuer2Id, rescuer1Id, rescueTime, admissionTime);
                }

        });
    }


    private updateValueAndValidity(patient: FormGroup, rescuer2Id: AbstractControl | null, rescuer1Id: AbstractControl | null,
        rescueTime: AbstractControl | null, admissionTime: AbstractControl | null) {

        patient.get('tagNumber')?.updateValueAndValidity({ emitEvent: false });
        patient.get('admissionArea')?.updateValueAndValidity({ emitEvent: false });
        rescuer2Id?.updateValueAndValidity({ emitEvent: false });
        rescuer1Id?.updateValueAndValidity({ emitEvent: false });
        rescueTime?.updateValueAndValidity({ emitEvent: false });
        admissionTime?.updateValueAndValidity({ emitEvent: false });
    }

    loadPatientArray(emergencyCaseId: number) {

        this.patientService.getPatientsByEmergencyCaseId(emergencyCaseId)
        .pipe(takeUntil(this.ngUnsubscribe))
        // tslint:disable-next-line: deprecation
        .subscribe((patients: Patients) => {

            patients.patients.forEach(patient => {
                        // We get a 0 or 1 from the database, so need to convert to a boolean.
                        patient.deleted = !!+patient.deleted;

                        const newPatient = this.populatePatient(true, patient);
                        this.patients.push(newPatient);
                    });

                    this.recordForm.patchValue(patients);

                    this.setChildOutcomeAsParentPatient(this.patients);

                },
                err => console.error(err),
                );
    }


    initPatientArray() {

        this.patients.clear();

        const patient = this.getEmptyPatient();

        this.patients.push(patient);

    }

    setChildOutcomeAsParentPatient(patients: FormArray) {

        patients.controls[0].valueChanges.subscribe(val=> {

            if(val.callOutcome.CallOutcome) {

                if(val.callOutcome.CallOutcome.CallOutcomeId === 1 && !val.admissionArea) {

                    patients.controls.forEach((patient)=> {

                        patient.get('callOutcome.CallOutcome')?.setValue({
                            CallOutcomeId : val.callOutcome.CallOutcome.CallOutcomeId,
                            CallOutcome: val.callOutcome.CallOutcome.CallOutcome
                        }, {emitEvent: false});

                        patient.get('isAdmission')?.setValue(true, {emitEvent: false});

                        patient.get('tagNumber')?.setValidators(Validators.required);
                        patient.get('tagNumber')?.updateValueAndValidity({ emitEvent: false });

                        patient.get('admissionArea')?.setValidators(Validators.required);
                        patient.get('admissionArea')?.updateValueAndValidity({ emitEvent: false });
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

}