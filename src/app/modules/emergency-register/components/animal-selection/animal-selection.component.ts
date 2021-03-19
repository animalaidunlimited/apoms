
import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipList } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { iif, Observable, Subject } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { MediaDialogComponent } from 'src/app/core/components/media-dialog/media-dialog.component';
import { AnimalType } from 'src/app/core/models/animal-type';
import { MediaItem } from 'src/app/core/models/media';
import { Patient, Patients } from 'src/app/core/models/patients';
import { Exclusions, ProblemDropdownResponse } from 'src/app/core/models/responses';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { UniqueTagNumberValidator } from 'src/app/core/validators/tag-number.validator';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { TagNumberDialog } from '../tag-number-dialog/tag-number-dialog.component';


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'animal-selection',
    templateUrl: './animal-selection.component.html',
    styleUrls: ['./animal-selection.component.scss'],
})
export class AnimalSelectionComponent implements OnInit{

    private ngUnsubscribe = new Subject();


    @Input() recordForm!: FormGroup;
    @ViewChild(MatTable, { static: true }) patientTable!: MatTable<any>;
    @ViewChild('problemChips', { static: true }) problemChips!: MatChipList;
    @ViewChild('addPatientBtn', {static: true}) addPatientBtn!: ElementRef;

    @ViewChild('auto') matAutocomplete!: MatAutocomplete;
    

    @ViewChild('problemsAutoOptions') problemsAutoOptions!: ElementRef;  

    currentPatientSpecies: string | undefined;
    emergencyCaseId: number | undefined;
    exclusions: Exclusions[] = [] as Exclusions[];

    problemsExclusions!: string[];
    
    selectedProblems:string[] = [];

    patientArrayDisplayedColumns: string[] = [
        /* 'select', */
        'animalType',
        'mainProblem',
        'tagNo',
        'media',
        'print',
        'delete',
    ];
    patients!:FormGroup;
    patientArray!:FormArray;

    form = new FormGroup({});
    
    patientDataSource: MatTableDataSource<FormGroup> = new MatTableDataSource([this.form]);

    

    selection: SelectionModel<FormGroup> = new SelectionModel<FormGroup>(true, []);
    tagNumber: string | undefined;
    validRow = true;

    emergencyCardHTML = '';

    @HostListener('document:keydown.control.p', ['$event'])
    addPatientTable(event: KeyboardEvent) {
        event.preventDefault();
        // this.addPatientRow();
       // this.speciesInput.toArray()[this.speciesInput.toArray().length - 1].nativeElement.focus();
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
            this.fb.group({
                patientArray: this.fb.array([this.getEmptyPatient()])
            })
        );
        
        this.patients = this.recordForm.get('patients') as FormGroup;
       
        this.patientArray = this.patients.get('patientArray') as FormArray;
        
        this.emergencyCaseId = this.recordForm.get('emergencyDetails.emergencyCaseId')?.value;
        this.recordForm.get('emergencyDetails.emergencyCaseId')?.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(newValue => this.emergencyCaseId = newValue);

        // this.subscribeToChanges();
       
    }
    


    deletePatient(patientIndex:number) {
        
        this.patientArray.removeAt(patientIndex);
    }

    addPatientRow(){
        if(this.patientArray.valid){ 
            const patient = this.getEmptyPatient();
            this.patientArray.push(patient);
        }
    }
  
   /* 

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    subscribeToChanges() {

        this.recordForm.get('patients')?.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(items => {

            if (items.length > 0) {
                if (items[0].patientId == null && items[0].position == null) {
                    this.initPatientArray();
                }
            }
        });
    }*/

    getEmptyPatient() {
        const patient = 
            this.fb.group({
                patientId: [],
                position: [],
                animalTypeId: ['', Validators.required],
                animalType: ['', Validators.required],
                problems: this.fb.array([],Validators.required),
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
    /*populatePatient(isUpdate: boolean, patient: Patient) {
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
        .subscribe((patients: Patients) => {


                    this.patientArray = this.recordForm.get('patients') as FormArray;

                    patients.patients.forEach(patient => {
                        // We get a 0 or 1 from the database, so need to convert to a boolean.
                        patient.deleted = !!+patient.deleted;

                        const newPatient = this.populatePatient(true, patient);

                        this.patientArray.push(newPatient);
                    });

                    this.recordForm.patchValue(patients);
                },
                err => console.error(err),
                () => this.resetTableDataSource(),
            );
    }

    initPatientArray() {
        this.patientArray = this.recordForm.get('patients') as FormArray;

        this.patientArray.clear();

        const patient = this.getEmptyPatient();

        this.patientArray.push(patient);

        this.resetTableDataSource();

        /* this.setSelected(1); 

        this.subscribeToChanges();
    }

    resetTableDataSource() {
        const patients:FormGroup[] = ((this.recordForm.get('patients') as FormArray).controls) as FormGroup[];

        this.patientDataSource = new MatTableDataSource(patients);

        this.selection = new SelectionModel<FormGroup>(true, []);
    }

    /** Whether the number of selected elements matches the total number of rows. 
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.patientDataSource.data.length;
        return numSelected === numRows;
    }

    toggleRow(row:FormGroup) {
        if(this.selection.isSelected(row)){
            row;
        }
        if(this.selection.selected.length !== 0 && this.selection.selected[0] !== row){

            // We only ever want to have one item selected at once, but WE want to control when the change happens and how.
            this.selection.toggle(this.selection.selected[0]);
            this.clearChips(); 
            this.selection.toggle(row);
        }
        else if (this.selection.selected.length !== 0 && this.selection.selected[0] === row){
            this.selection.toggle(this.selection.selected[0]);
            this.clearChips(); 
        }
        else {
            this.selection.toggle(row);
        }
    }

    selectIfNotSelected(row:FormGroup){

        if (!this.selection.isSelected(row)){
            this.toggleRow(row);
        }

    }


    /** The label for the checkbox on the passed row */
/*     checkboxLabel(row?: FormGroup): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${
            this.selection.isSelected(row) ? 'deselect' : 'select'
        } row ${row.get('position')?.value + 1}`;
    } */

    /* clearChips() {
        this.currentPatientChip = '';

        // Get all of the chip lists on the page and reset them all.
        this.animalTypeChips.chips.forEach(chip => {
            chip.selected = false;
            chip.disabled = false;
            chip.selectable = true;
        });

        this.problemChips.chips.forEach(chip => {
            chip.selected = false;
            chip.disabled = false;
            chip.selectable = true;
        });
    } 


    setSelected(position: number) {

        // Set the new row to be selected
        const selected = this.patientDataSource.data.find(row => row.get('position')?.value === position);

        if(selected === undefined){
            throw new TypeError('Selected value was not found!');
        }

        this.selection.select(selected);
    } 

    focusProblemChip(event:any, problemChip:any) {
        if (event.keyCode >= 65 && event.keyCode <= 90) {
            const chips = this.problemChips.chips;

            const foundChip = chips
                .filter(allChips => allChips.disabled === false)
                .find(chip => chip.value.substr(0, 1).toLowerCase() === event.key.toLowerCase());

            if (foundChip) {
                foundChip.focus();
            }

        } else if (event.keyCode === 13) { // space
            this.problemChipSelected(problemChip);
        }
    }

   
    problemChipSelected(problemChip:any) {

        this.recordForm.markAsDirty();

        if(!problemChip.selected)
        {
            this.updatePatientProblemArray(problemChip);
            return;
        }

        if (!problemChip.selectable && problemChip.selected) {
            problemChip.selected = false;
            return;
        }

        if (
            !this.currentPatientSpecies  &&
            !(this.animalTypeList.selected instanceof MatChip) 
        ) {

            // TODO replace this with a better dialog.
            alert('Please select an animal');
            problemChip.selected = false;
            return;
        }
        else {
            this.updatePatientProblemArray(problemChip);
        }
    }

    getcurrentPatient() {
        return this.selection.selected[0];
    }

    

 

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
    }

    openMediaDialog(mediaObject:MediaItem): void{

        const currentPatient: FormGroup = this.getcurrentPatient();

        const dialogRef = this.dialog.open(MediaDialogComponent, {
            minWidth: '50%',
            data: {
                tagNumber: currentPatient.get('tagNumber')?.value,
                patientId: currentPatient.get('patientId')?.value,
                mediaItem: mediaObject
            }
        });

    }

    printEmergencyCard(row:FormGroup){

        const printTemplateId = this.userOptions.getEmergencyCardTemplateId();

        this.printService.printPatientDocument(printTemplateId, row.get('patientId')?.value);

    }


    // If you tab into the chip lists, you have to tab through them all to get out.
    // So the below finds the last element and skips to the next value
    tabPressed($event:Event,index:number){
        $event.preventDefault();
        this.cdr.detectChanges();        
        this.problemAuto.toArray()[index].nativeElement.focus()
       
    }

    shiftTabPressed($event: Event,index:number){
        $event.preventDefault();
        // this.speciesInput.toArray()[index].nativeElement.focus();
    }
    
      
    checkSpecies(row:FormGroup,index:number){
        if(this.selection.isSelected(row)){
            const currentPatient = this.getcurrentPatient() as FormGroup;
            const selectedSpecies =  currentPatient.get('animalType')?.value;
            if (selectedSpecies === '') {

                // TODO replace this with a better dialog.
                this.problemAuto.toArray()[index].nativeElement.blur();
                alert('Please select an animal');
            }
        }else{
            return;
        }
    }


    setMainProblemError(row:FormGroup, index:number){
        if(this.selection.isSelected(row)){
            const currentPatient = this.getcurrentPatient() as FormGroup;
            const selectedProblems =  currentPatient.get('problemsString')?.value;
        }else{
            return;
        }
        
    }   

    checkRowSelected($event:Event, row: FormGroup){
        $event.stopPropagation();
        if(!this.selection.isSelected(row)){
            return;
        }
    }
    */
}