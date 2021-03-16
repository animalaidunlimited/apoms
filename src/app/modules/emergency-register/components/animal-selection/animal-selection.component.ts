import { Component, ViewChild, OnInit, Input, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatChip, MatChipList } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { TagNumberDialog } from '../tag-number-dialog/tag-number-dialog.component';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { AnimalType } from 'src/app/core/models/animal-type';
import { UniqueTagNumberValidator } from 'src/app/core/validators/tag-number.validator';
import { Patient, Patients } from 'src/app/core/models/patients';
import { Exclusions, ProblemDropdownResponse } from 'src/app/core/models/responses';
import { MediaDialogComponent } from 'src/app/core/components/media-dialog/media-dialog.component';
import { MediaPasteService } from 'src/app/core/services/navigation/media-paste/media-paste.service';
import { MediaItem } from 'src/app/core/models/media';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    @ViewChild('animalTypeChips', { static: true }) animalTypeChips!: MatChipList;
    @ViewChild('problemChips', { static: true }) problemChips!: MatChipList;
    @ViewChild('animalTypeChips', { read: ElementRef, static:true }) animalTypeChipsElement!: ElementRef;

    // I used animalTypes$ instead of animalType here to make the ngFors more readable (let specie(?) of animalType )
    animalTypes$: AnimalType[] = [] as AnimalType[];

    currentPatientChip: string | undefined;
    emergencyCaseId: number | undefined;
    exclusions: Exclusions[] = [] as Exclusions[];

    patientArrayDisplayedColumns: string[] = [
        'select',
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

    problems$: ProblemDropdownResponse[] = [];

    selection: SelectionModel<FormGroup> = new SelectionModel<FormGroup>(true, []);
    tagNumber: string | undefined;
    validRow = true;

    emergencyCardHTML = '';

    @HostListener('document:keydown.control.enter', ['$event'])
    catchControlEnter(event: KeyboardEvent) {
        event.preventDefault();

        // Check to see if this component is visible because the hostlistener listens to the window, and not just to this component
        // So unless we check to see which version of this component is visible, we won't know which tab to update.
        if(this.animalTypeChipsElement.nativeElement.offsetParent){

            this.updateTag(this.getcurrentPatient());
        }
    }

    constructor(
        private dialog: MatDialog,
        private fb: FormBuilder,
        private patientService: PatientService,
        private tagNumberValidator: UniqueTagNumberValidator,
        private dropdown: DropdownService,
        private printService: PrintTemplateService,
        private userOptions: UserOptionsService,
        private mediaPaster: MediaPasteService
    ) {}

    ngOnInit() {

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
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(animalTypes => (this.animalTypes$ = animalTypes.sort((a,b) =>

                a.AnimalType.substr(0,1) < b.AnimalType.substr(0,1) ? -1 : a.AnimalType.substr(0,1) > b.AnimalType.substr(0,1) ? 1 : a.Sort - b.Sort)));

        this.dropdown
            .getProblems()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(problems => {
                this.problems$ = problems.sort((a,b) => a.Problem < b.Problem ? -1 : 1);
            });

        this.exclusions = this.dropdown.getExclusions();

        this.subscribeToChanges();
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
                    this.clearChips();
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
            animalTypeId: [''],
            animalType: [''],
            problems,
            problemsString: ['', Validators.required],
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

        if(this.selection.selected.length !== 0 && this.selection.selected[0] !== row){

            // We only ever want to have one item selected at once, but WE want to control when the change happens and how.
            this.selection.toggle(this.selection.selected[0]);
            this.clearChips();
            this.selection.toggle(row);
            this.reloadChips();
        }
        else if (this.selection.selected.length !== 0 && this.selection.selected[0] === row){
            this.selection.toggle(this.selection.selected[0]);
            this.clearChips();
        }
        else {
            this.selection.toggle(row);
            this.reloadChips();
        }
    }

    selectIfNotSelected(row:FormGroup){

        if (!this.selection.isSelected(row)){
            this.toggleRow(row);
        }

    }


    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: FormGroup): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${
            this.selection.isSelected(row) ? 'deselect' : 'select'
        } row ${row.get('position')?.value + 1}`;
    }

    clearChips() {
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

    reloadChips() {
        const currentPatient = this.getcurrentPatient();

        if (!currentPatient) {
            return;
        }

        const currentAnimal = currentPatient.get('animalType')?.value;

        this.animalTypeChips.chips.forEach(chip => {
            currentAnimal === chip.value
                ? (chip.toggleSelected(),
                  (this.currentPatientChip = chip.value))
                // tslint:disable-next-line: no-unused-expression
                : chip.deselect;
        });

        const problems = currentPatient.get('problems') as FormArray;

        problems.controls.forEach(problem => {
            this.problemChips.chips.forEach(chip => {
                problem.get('problem')?.value === chip.value
                    ? chip.toggleSelected()
                    // tslint:disable-next-line: no-unused-expression
                    : chip.deselect;
            });
        });
    }

    animalChipSelected(animalTypeChip:any) {

        this.recordForm.markAsDirty();

        this.currentPatientChip = undefined;

        const selectedCount: number = this.selection.selected.length;

        if (selectedCount > 1) {
            alert('Please select only one animal in the table to change');
            return;
        }

        this.currentPatientChip = animalTypeChip.isSelected
            ? animalTypeChip.value
            : undefined;

        if (
            selectedCount === 1 &&
            (animalTypeChip.selected ||
                !(this.animalTypeChips.selected instanceof MatChip))
        ) {
            // There is only 1 row selected, so we can update the animal for that row
            let animalTypeObject;

            animalTypeObject = this.getAnimalFromObservable(animalTypeChip.value);

            const currentPatient = this.getcurrentPatient();

            currentPatient.get('animalType')?.setValue(animalTypeChip.selected ? animalTypeObject?.AnimalType : null );

            currentPatient.get('animalTypeId')?.setValue(animalTypeChip.selected ? animalTypeObject?.AnimalTypeId : null);

            currentPatient.get('updated')?.setValue(true);
        }

        // if there are no rows, then we need to add a new one
        if (selectedCount === 0 && animalTypeChip.selected) {

            const currentAnimalType = this.getAnimalFromObservable( animalTypeChip.value );

            const position: number = this.patientDataSource.data.length + 1;

            const newPatient = this.getEmptyPatient();

            newPatient.get('position')?.setValue(position);
            newPatient.get('animalTypeId')?.setValue(currentAnimalType?.AnimalTypeId);
            newPatient.get('animalType')?.setValue(currentAnimalType?.AnimalType);

            this.patientArray.push(newPatient);

            this.setSelected(position);
        }

        this.hideIrrelevantChips(animalTypeChip);
        this.patientTable.renderRows();
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

    cycleChips(event:any, chipGroup: string, property: string) {

        if (event.keyCode >= 65 && event.keyCode <= 90) {

            const currentPatient = this.getcurrentPatient().get(property)?.value || '';

            let chips;

            if (chipGroup === 'animaltype') {
                chips = this.animalTypeChips.chips;
            } else if (chipGroup === 'problem') {
                chips = this.problemChips.chips;
            }

            let lastInstance = '';
            let currentIndex:any;

            // Get the last value of the current key (e.g. last animal beginning with p)
            // Also get the index of the current item
            chips?.forEach((item, index) => {
                if (
                    item.value.substr(0, 1).toLowerCase() === currentPatient.substr(0, 1).toLowerCase()
                ) {
                    lastInstance = item.value;
                }

                if (item.value === currentPatient) {
                    currentIndex = index;
                }
            });

            // Filter out any previous records so we can go directly to the next one in the list
            const currentArray = chips?.filter((chip, index) =>

                    !(  chip.value.substr(0, 1).toLowerCase() === currentPatient.substr(0, 1).toLowerCase() &&
                        index <= currentIndex
                    ) || currentPatient === '' || lastInstance === currentPatient

        );

            // Get the chip we need
            const currentKeyChip = currentArray?.find(chip => chip.value.substr(0, 1).toLowerCase() === event.key.toLowerCase());

            if(currentKeyChip){
                currentKeyChip.selected = true;
            }

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
            !this.currentPatientChip &&
            !(this.animalTypeChips.selected instanceof MatChip)
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

    hideIrrelevantChips(animalTypeChip:any) {

        const currentExclusions = this.exclusions.filter(
            (animalType) => animalType.animalType === animalTypeChip.value,
        );

        // Get the current patient and check if we're swtiching between animal chips, because if so we'll receive 3 calls,
        // two for the new patient type, followed by an unset for the old patient type
        const currentPatient = this.getcurrentPatient();

        if(!currentPatient){
            return;
        }

        if(!(currentPatient.get('animalType')?.value === animalTypeChip.value) && !animalTypeChip.selected){
            return;
        }

        this.problemChips.chips.forEach(chip => {
            chip.disabled = false;
            chip.selectable = true;
        });


        if (!animalTypeChip.selected) {
            return;
        }

        currentExclusions[0]?.exclusionList.forEach((exclusion:any) => {

            this.problemChips.chips.forEach(chip => {

                if (chip.value === exclusion) {
                    chip.disabled = true;
                    chip.selectable = false;
                    chip.selected = false;
                }
            });
        });
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

        this.clearChips();

        this.patientTable.renderRows();
    }

    updatePatientProblemArray(problemChip:any) {

        const currentPatient = this.getcurrentPatient() as FormGroup;

        if(!currentPatient){
            return;
        }

        // Get the current list of problems and replace the existing problem array
        let problemsObject: ProblemDropdownResponse | undefined;

        problemsObject = this.problems$.find(item => item.Problem === problemChip.value);

        if(problemsObject === undefined){
            throw new TypeError('Missing problem in problem list!');
        }

        const problemsGroup = this.fb.group({
            problemId: [problemsObject.ProblemId, Validators.required],
            problem: [problemsObject.Problem, Validators.required],
        });

        // If the problem chip has been selected we need to add it to the problem array of the animal
        // else we need to find this problem in the array and remove it.
        const problems = currentPatient.get('problems') as FormArray;

        const problemIndex = problems.controls.findIndex(
            problem =>
                problem.get('problemId')?.value === problemsObject?.ProblemId,
        );

        if (problemChip.selected && problemIndex === -1) {
            problems.push(problemsGroup);
            currentPatient.get('updated')?.setValue(true);
        }

        if (!problemChip.selected) {
            problems.removeAt(problemIndex);
        }

        const problemString = problems.controls
            .map(problem => problem.get('problem')?.value)
            .join(',');

        currentPatient.get('problemsString')?.setValue(problemString);

        this.patientTable.renderRows();
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

    getAnimalFromObservable(name: string) {
        return this.animalTypes$.find(
            animalType => animalType.AnimalType === name,
        );
    }

    // If you tab into the chip lists, you have to tab through them all to get out.
    // So the below finds the last element and skips to the next value
    tabPressed(list:string){

        if(list === 'AnimalType'){
            this.animalTypeChips.chips.last.focus();
        }
        else if (list === 'ProblemType'){
            this.problemChips.chips.last.focus();
        }
    }

    shiftTabPressed(list:string){

        if(list === 'AnimalType'){
            this.animalTypeChips.chips.first.focus();
        }
        else if (list === 'ProblemType'){
            this.problemChips.chips.first.focus();
        }
    }

}