
import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatChipList } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { iif, Observable, Subject } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { Patient, Patients } from 'src/app/core/models/patients';
import { Exclusions, ProblemDropdownResponse } from 'src/app/core/models/responses';
import { MediaDialogComponent } from 'src/app/core/components/media-dialog/media-dialog.component';
import { MediaPasteService } from 'src/app/core/services/navigation/media-paste/media-paste.service';
import { MediaItem } from 'src/app/core/models/media';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { UniqueTagNumberValidator } from 'src/app/core/validators/tag-number.validator';
import { EmergencyRegisterPatientComponent } from '../emergency-register-patient/emergency-register-patient.component';
import { TagNumberDialog } from '../tag-number-dialog/tag-number-dialog.component';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'animal-selection',
    templateUrl: './animal-selection.component.html',
    styleUrls: ['./animal-selection.component.scss'],
})
export class AnimalSelectionComponent implements OnInit,OnDestroy{

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

        // Check to see if this component is visible because the hostlistener listens to the window, and not just to this component
        // So unless we check to see which version of this component is visible, we won't know which tab to update.
        /* if(this.animalTypeChipsElement.nativeElement.offsetParent){

            this.updateTag(this.getcurrentPatient());
        } */
    }

    constructor(
        private dialog: MatDialog,
        private fb: FormBuilder,
        private patientService: PatientService,
        private tagNumberValidator: UniqueTagNumberValidator,
        private dropdown: DropdownService,
        private printService: PrintTemplateService,
        private userOptions: UserOptionsService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {

        
        this.recordForm.addControl('patients', 
            this.fb.array([])
        );
    
        this.patients = this.recordForm.get('patients') as FormArray;
        
        this.emergencyCaseId = this.recordForm.get('emergencyDetails.emergencyCaseId')?.value;
        
        this.recordForm.get('emergencyDetails.emergencyCaseId')?.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        // tslint:disable-next-line: deprecation
        .subscribe(newValue => this.emergencyCaseId = newValue);

        this.emergencyCaseId
        ? this.loadPatientArray(this.emergencyCaseId)
            : this.initPatientArray();

        // this.subscribeToChanges();
       
    }
    


    deletePatient(patientIndex:number) {
        
        this.patients.removeAt(patientIndex);
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
            });
            const patientIdControl = patient.get('patientId');

            if(!patientIdControl){
                throw new TypeError('patientIdControl is undefined');
            }

            patient.get('tagNumber')?.setAsyncValidators(this.tagNumberValidator.validate(
                this.emergencyCaseId || -1,
                patientIdControl,
            ));
        return patient;
    }

    // TODO fix any issues with the update flag here.
    // We'll need to make sure we're only updating patients that we need to update
    // and not just deleting them all and recreating.
    populatePatient(isUpdate: boolean, patient: Patient) {




        const problems = this.fb.array([]);

        patient.problems.forEach(problem => {
            const newProblem = this.fb.group({
                problemId: [problem.problemId],
                problem: [problem.problem],
            });
            problems.push(newProblem);
        });
       
        return this.getPatient(
            problems,
            patient.position,
            isUpdate,
            patient.patientId,
        );
    }

    
    getPatient(problems: FormArray, position: number, isUpdate: boolean, patientId: number) {




        const newPatient = this.fb.group({
            patientId: [patientId],
            position: [position],
            animalTypeId: ['', Validators.required],
            animalType: ['', Validators.required],
            problems,
            tagNumber: [''],
            duplicateTag: [false, Validators.required],
            updated: [isUpdate, Validators.required],
            deleted: [false, Validators.required],
        });

        const patientIdControl = newPatient.get('patientId');

        if(!patientIdControl){
            throw new TypeError('patientIdControl is undefined');
        }
        newPatient.get('tagNumber')?.setAsyncValidators(this.tagNumberValidator.validate(
            this.emergencyCaseId || -1,
            patientIdControl,
        ));

        return newPatient;
    }
    loadPatientArray(emergencyCaseId: number) {




        this.patientService.getPatientsByEmergencyCaseId(emergencyCaseId)
        .pipe(takeUntil(this.ngUnsubscribe))
        // tslint:disable-next-line: deprecation
        .subscribe((patients: Patients) => {                                      patients.patients.forEach(patient => {
                        // We get a 0 or 1 from the database, so need to convert to a boolean.
                        patient.deleted = !!+patient.deleted;

                        const newPatient = this.populatePatient(true, patient);
                        this.patients.push(newPatient);
                    });

                    this.recordForm.patchValue(patients);
                },
                err => console.error(err),
                );
    }
    initPatientArray() {
  
        this.patients.clear();

        const patient = this.getEmptyPatient();

        this.patients.push(patient);

    }

    /*
   

    updateTag(currentPatient:any) {

        if(this.selection.selected.length === 0){

            // TODO make this a pretty dialog
            alert('Please select a patient to update');
            return;
        }

        if(this.selection.selected.length !== 0 && this.selection.isSelected(currentPatient)) {

            this.openTagNumberDialog(currentPatient.value);
            this.recordForm.markAsDirty();
        }
    }

    openTagNumberDialog(event:any): void {

        const currentPatient: Patient = event;

        const dialogRef = this.dialog.open(TagNumberDialog, {
            width: '250px',
            data: {
                tagNumber: currentPatient.tagNumber,
                emergencyCaseId: this.emergencyCaseId,
                patientId: currentPatient.patientId,
                duplicateTag: currentPatient.duplicateTag
            },
        });

        dialogRef.afterClosed()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(result => {

            if (result) {
                const resultCurrentPatient = this.getcurrentPatient();

                resultCurrentPatient.get('tagNumber')?.setValue(result.value);

                if(this.recordForm.get('callOutcome.CallOutcome')?.value?.CallOutcomeId === 18){
                    resultCurrentPatient.get('tagNumber')?.setValidators(Validators.required);
                    resultCurrentPatient.get('tagNumber')?.updateValueAndValidity();
                }

                resultCurrentPatient.get('duplicateTag')?.setValue(result.status);

                resultCurrentPatient.get('updated')?.setValue(true);
                this.patientTable.renderRows();
            }
        });

    */
}