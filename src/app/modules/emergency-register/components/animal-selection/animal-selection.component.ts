import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';	
import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
export class AnimalSelectionComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();


    @Input() recordForm!: FormGroup;
    @ViewChild(MatTable, { static: true }) patientTable!: MatTable<any>;
    @ViewChild('problemChips', { static: true }) problemChips!: MatChipList;
    @ViewChild('addPatientBtn', {static: true}) addPatientBtn!: ElementRef;

    @ViewChildren('problemAuto') problemAuto!: QueryList<ElementRef<HTMLInputElement>>;
    @ViewChildren('speciesInput') speciesInput!: QueryList<ElementRef<HTMLInputElement>>;
    @ViewChild('auto') matAutocomplete!: MatAutocomplete;
    

    @ViewChild('problemsAutoOptions') problemsAutoOptions!: ElementRef;

    // I used animalTypes$ instead of animalType here to make the ngFors more readable (let specie(?) of animalType )
    animalTypes$: AnimalType[] = [] as AnimalType[];

    errorMatcher = new CrossFieldErrorMatcher();

    selectable = true;
    removable = true;
    
    showMainProblemError:boolean[]=[] ;

    showMainProbelmChipList:boolean[] =[];
    problemInput = new FormControl();
    animalInput = new FormControl('', Validators.required);
    currentPatientChip: string | undefined;
    emergencyCaseId: number | undefined;
    exclusions: Exclusions[] = [] as Exclusions[];

    problemsExclusions!: string[];
    filteredProblems!: Observable<ProblemDropdownResponse[]>;
    filteredAnimalTypes!:Observable<AnimalType[]>;

    problems$: ProblemDropdownResponse[] = [];

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

    patientArray:FormArray  = new FormArray([]);

    form = new FormGroup({});
    
    patientDataSource: MatTableDataSource<FormGroup> = new MatTableDataSource([this.form]);

    

    selection: SelectionModel<FormGroup> = new SelectionModel<FormGroup>(true, []);
    tagNumber: string | undefined;
    validRow =true;

    emergencyCardHTML = '';

    @HostListener('document:keydown.control.p', ['$event'])
    addPatientTable(event: KeyboardEvent) {
        event.preventDefault();
        this.addPatientRow();
       this.speciesInput.toArray()[this.speciesInput.toArray().length - 1].nativeElement.focus();
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
        this.addEmptyShowHideToggle();
        this.recordForm.addControl('patients', this.fb.array([]));

        this.emergencyCaseId = this.recordForm.get('emergencyDetails.emergencyCaseId')?.value;
        this.recordForm.get('emergencyDetails.emergencyCaseId')?.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(newValue => this.emergencyCaseId = newValue);

        // if we have a case id we're doing a reload. Otherwise this is a new case.
        this.emergencyCaseId
        ? this.loadPatientArray(this.emergencyCaseId)
            : this.initPatientArray();

        this.dropdown
            .getAnimalTypes()
            .pipe(
                
                map((animalTypes:AnimalType[]) => animalTypes.sort((a,b) => (a.AnimalType > b.AnimalType) ? 1 : ((b.AnimalType > a.AnimalType) ? -1 : 0))),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(animalTypes => (this.animalTypes$ = animalTypes));

        this.dropdown
            .getProblems()
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((problems:ProblemDropdownResponse[]) => problems.sort((a,b) => (a.Problem > b.Problem) ? 1 : ((b.Problem > a.Problem) ? -1 : 0)))
            )
            .subscribe(problems => this.problems$ = problems);

        this.exclusions = this.dropdown.getExclusions();

        this.subscribeToChanges();
        
        this.filteredProblems = 
        this.problemInput.valueChanges.pipe(
            startWith(''),
            switchMap(problem => this.problemFilter(problem)),
            map(problems => {
                const currentPatient = this.getcurrentPatient() as FormGroup;
                const selectedProblems =  currentPatient.get('problems')?.value;
                if(selectedProblems !== ''){
                    const problemsArray = selectedProblems.map((problemOption:{problemId: number, problem: string}) => problemOption.problem.trim());
                    const filteredProblemsArray = problems.filter(problem => !problemsArray.includes(problem.Problem.trim()));
                    return filteredProblemsArray;
                }else{
                    return problems;
                }
            }),
            map(problems => {
                return this.problemsExclusions ? problems.filter(problem => !this.problemsExclusions.includes(problem.Problem.trim())):
                        problems;
            })
        );


        this.filteredAnimalTypes = 
            this.animalInput.valueChanges.pipe(
                startWith(''),
                switchMap(animalType => iif(
                    () => typeof animalType === 'string'
                        , this.animalFilter(animalType)
                        , this.dropdown.getAnimalTypes()
             ))
            );
      
    }

    addEmptyShowHideToggle(){
        this.showMainProblemError.push(true);
        
        this.showMainProbelmChipList.push(false);
        
    }
    animalFilter(filterValue:string){
        return this.dropdown.getAnimalTypes().pipe(
            map(animalTypes => animalTypes.filter(animalType => animalType.AnimalType.toLowerCase().indexOf(filterValue.toLowerCase()) === 0))
        );
    }

    problemFilter(filterValue:any) {
        if(typeof filterValue === 'string' || filterValue?.Problem){
            const searchTerm = typeof filterValue === 'string' ? filterValue : filterValue.Problem;

            return this.dropdown.getProblems().pipe(
                map(problems => problems.filter(option => option.Problem.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0))
            );
        }else{
                return this.dropdown.getProblems();
        }
    }

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
    }

    getEmptyPatient() {
        const problems = this.fb.array([]);

        return this.getPatient(problems, 1, true, 0);
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

        this.setSelected(1);

        this.subscribeToChanges();
    }

    resetTableDataSource() {
        const patients:FormGroup[] = ((this.recordForm.get('patients') as FormArray).controls) as FormGroup[];

        this.patientDataSource = new MatTableDataSource(patients);

        this.selection = new SelectionModel<FormGroup>(true, []);
    }

    /** Whether the number of selected elements matches the total number of rows. */
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
            /* this.clearChips(); */
            this.selection.toggle(row);
        }
        else if (this.selection.selected.length !== 0 && this.selection.selected[0] === row){
            this.selection.toggle(this.selection.selected[0]);
            /* this.clearChips(); */
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
    } */

   
    animalSelected($event:MatAutocompleteSelectedEvent, index:number):void {

        this.recordForm.markAsDirty();

        // this.currentPatientChip = undefined;

        const selectedCount: number = this.selection.selected.length;

        if (selectedCount > 1) {
            alert('Please select only one animal in the table to change');
            return;
        }
        
        // this.currentPatientChip = $event.option.viewValue;
     

       if (selectedCount === 1 ) {
            // There is only 1 row selected, so we can update the animal for that row
            // let animalTypeObject;

           // animalTypeObject = this.getAnimalFromObservable(animalTypeChip.value);

            const currentPatient = this.getcurrentPatient();

            currentPatient.get('animalType')?.setValue($event.option.viewValue);

            currentPatient.get('animalTypeId')?.setValue($event.option.value);

            currentPatient.get('updated')?.setValue(true);
            this.speciesInput.toArray()[index].nativeElement.value = $event.option.viewValue;
        }

        // if there are no rows, then we need to add a new one
         if (selectedCount === 0) {

            const currentAnimalType = this.getAnimalFromObservable( $event.option.viewValue );

            const position: number = this.patientDataSource.data.length + 1;

            const newPatient = this.getEmptyPatient();

            newPatient.get('position')?.setValue(position);
            newPatient.get('animalTypeId')?.setValue(currentAnimalType?.AnimalTypeId);
            newPatient.get('animalType')?.setValue(currentAnimalType?.AnimalType);

            this.patientArray.push(newPatient);

            this.setSelected(position);
        }
        this.hideIrrelevantChips($event.option.viewValue); 
        this.patientTable.renderRows();
    }

    addPatientRow(){
        if(this.patientArray.valid){
            this.addEmptyShowHideToggle();
            const patient = this.getEmptyPatient();
            this.patientArray.push(patient);
            this.resetTableDataSource();
            const selected = this.patientDataSource.data[this.patientArray.length - 1];
            this.selection.select(selected);
            this.subscribeToChanges();

        }
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
            !this.currentPatientChip /* &&
            !(this.animalTypeList.selected instanceof MatChip) */
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

    hideIrrelevantChips(animal:string) {
       

        const currentExclusions = this.exclusions.filter(
            (animalType) => animalType.animalType === animal,
        );
        
        // Get the current patient and check if we're swtiching between animal chips, because if so we'll receive 3 calls,
        // two for the new patient type, followed by an unset for the old patient type
        const currentPatient = this.getcurrentPatient();

        if(!currentPatient){
            return;
        }

        if(!(currentPatient.get('animalType')?.value === animal)){
            return;
        }
        this.problemsExclusions = currentExclusions[0]?.exclusionList;
    }

    getcurrentPatient() {
        return this.selection.selected[0];
    }

    deletePatientRow(row:FormGroup) {
        const position = row.get('position')?.value;

        const deleted = row.get('deleted')?.value;

        const patients = this.recordForm.get('patients') as FormArray;

        const removeIndex = patients.controls.findIndex(
            patient => patient.get('position')?.value === position,
        );

        // if there's no patient id and we click delete, let's get rid of the patient.
        if (!row.get('patientId')?.value) {
            patients.removeAt(removeIndex);
        } else {
            const currentPatient = patients.controls.find(
                patient => patient.get('position')?.value === position,
            );

            currentPatient?.get('deleted')?.setValue(!deleted);
            currentPatient?.get('updated')?.setValue(true);
        }

        this.selection.clear();

        /* this.clearChips(); */

        this.patientTable.renderRows();
    }

    updatePatientProblemArray(event :MatAutocompleteSelectedEvent): void {

        this.problemAuto.first.nativeElement.value = '';

        const currentPatient = this.getcurrentPatient() as FormGroup;
       
        if(!currentPatient){
            return;
        }

        // Get the current list of problems and replace the existing problem array
        // let problemsObject: ProblemDropdownResponse | undefined;

        // problemsObject = this.problems$.find(item => item.Problem === problemChip.value);

        /* if(problemsObject === undefined){
            throw new TypeError('Missing problem in problem list!');
        } */

        const problemsGroup = this.fb.group({
            problemId: [event.option.value, Validators.required],
            problem: [event.option.viewValue, Validators.required],
        });

        // If the problem chip has been selected we need to add it to the problem array of the animal
        // else we need to find this problem in the array and remove it.
        const problems = currentPatient.get('problems') as FormArray;
 
        const problemIndex = problems.controls.findIndex(
            problem =>
                problem.get('problemId')?.value === event.option.value,
        );

        if (problemIndex === -1) {
            problems.push(problemsGroup);
            currentPatient.get('updated')?.setValue(true);
        }

        this.patientTable.renderRows();
    }

    remove(removeProblem:number){
        
        const currentPatient = this.getcurrentPatient() as FormGroup;
       
        if(!currentPatient){
            return;
        }

         const problems = currentPatient.get('problems') as FormArray;
         const problemIndex = problems.controls.findIndex(
            problem =>
                problem.get('problemId')?.value === removeProblem,
        );

        problems.removeAt(problemIndex);
       
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

    getAnimalFromObservable(name: string) {
        return this.animalTypes$.find(
            animalType => animalType.AnimalType === name,
        );
    }

    // If you tab into the chip lists, you have to tab through them all to get out.
    // So the below finds the last element and skips to the next value
    tabPressed($event:Event,index:number){
        $event.preventDefault();
        this.showMainProblemError[index] = false;
        this.showMainProbelmChipList[index] = true;
        this.cdr.detectChanges();        
        this.problemAuto.toArray()[index].nativeElement.focus()
       
    }

    shiftTabPressed($event: Event,index:number){
        $event.preventDefault();
        this.speciesInput.toArray()[index].nativeElement.focus();
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

    

    changeFocusToProblemsSelection($event:MouseEvent | KeyboardEvent | FocusEvent, index:number){
        $event.stopPropagation();
        this.showMainProblemError[index] = false;
        this.showMainProbelmChipList[index] = true;
        this.cdr.detectChanges();
        this.problemAuto.toArray()[index].nativeElement.focus();
    }

    setMainProblemError(row:FormGroup, index:number){
        if(this.selection.isSelected(row)){
            const currentPatient = this.getcurrentPatient() as FormGroup;
            const selectedProblems =  currentPatient.get('problemsString')?.value;
            this.showMainProblemError[index] =  selectedProblems === '' ? true : false;
            this.showMainProbelmChipList[index] = !this.showMainProblemError[index]; 
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
    
}