import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormArray, UntypedFormBuilder, Validators, FormControl, FormGroup} from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil, take } from 'rxjs/operators';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';
import { AnimalType } from 'src/app/core/models/animal-type';
import { Exclusions, ProblemDropdownResponse } from 'src/app/core/models/responses';
import { TreatmentArea } from 'src/app/core/models/treatment-lists';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { TreatmentListService } from 'src/app/modules/treatment-list/services/treatment-list.service';
import { animalTypeValidator } from '../../validators/animal-type.validator';
import { MatChipGrid, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';


interface Problem {
  problemId: number;
  problem: string;
}
@Component({
  selector: 'app-emergency-register-patient',
  templateUrl: './emergency-register-patient.component.html',
  styleUrls: ['./emergency-register-patient.component.scss']
})

export class EmergencyRegisterPatientComponent implements OnInit, AfterViewInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  @Input() patientIndex!: number;
  @Input() isDisplayOnly!: boolean;
  @Input() patientFormInput!: any;
  @Input()

  set callOutcome(callOutcome: string) { this._callOutcome = callOutcome; }
  get callOutcome(): string { return this._callOutcome; }
    
  @Input() outcome!: boolean;
  
  @Output() problemTab:EventEmitter<boolean> = new EventEmitter();
  @Output() deletedPatientIndex:EventEmitter<number> = new EventEmitter();
  
  @ViewChild('problemRef') problemRef!: ElementRef;
  @ViewChild('problemChipGrid', {static: false}) problemChipGrid!: MatChipGrid;
  @ViewChild('animalTypeInput') animalTypeInput!: ElementRef;
  @ViewChild('tagNumber') tagNumber!: ElementRef;
  @ViewChild('animalTypeInput', { read: MatAutocompleteTrigger }) animalAutoComplete! : MatAutocompleteTrigger;
  @ViewChild('problemRef', { read: MatAutocompleteTrigger }) problemAutoComplete!: MatAutocompleteTrigger;
  
  get animalType() { return this.patientForm?.get('animalType') as FormControl; };
  get problemsArray() { return this.patientForm?.get('problems') as FormArray };
  
  private animalTypeValueChangesUnsubscribe = new Subject();
  
  private _callOutcome = '';

  currentPatientSpecies: string | undefined;
  errorMatcher = new CrossFieldErrorMatcher();
  exclusions: Exclusions[] = [] as Exclusions[];

  filteredAnimalTypes$!:AnimalType[];
  filteredProblems$!: Observable<ProblemDropdownResponse[]>;

  patientDeletedFlag = false;
  patientForm: FormGroup = new FormGroup({});
  problemInput = new FormControl<ProblemDropdownResponse | string | null>({ value: null, disabled: true }, { nonNullable: true });
  problemTooltip: string = "";
  problemsExclusions$ = new BehaviorSubject<string[]>(['']);

  filteredProblems2$!: Observable<ProblemDropdownResponse[]>;

  rawProblems!: ProblemDropdownResponse[];

  removable = true;
  selectable = true;

  separatorKeysCodes: number[] = [ENTER, COMMA];

  sortedAnimalTypes!: AnimalType[];

  sortedProblems = this.dropdown.getProblems().pipe(
    map( problems =>
      {
        const selectedProblems = this.problemsArray?.value as Problem[];
        const problemsArray = selectedProblems.map((problemOption:Problem) => problemOption.problem?.trim());

        return problems.filter(problem => !problemsArray.includes(problem.Problem.trim()) && !(this.problemsExclusions$.value).includes(problem.Problem.trim()));
      }
    ),
    map(problems => problems.sort((a,b) => a.SortOrder - b.SortOrder))
  );


  treatmentAreaNames$!: Observable<TreatmentArea[]>;

  

  constructor(
    private dropdown: DropdownService,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private treatmentListService: TreatmentListService,
    private printService: PrintTemplateService,
    private userOptions: UserOptionsService,
    private snackbar: SnackbarService
  ) {     

   }

  ngOnInit(): void {   
    
    this.dropdown.getProblems().pipe(takeUntil(this.ngUnsubscribe)).subscribe(problems => this.rawProblems = problems);  

    this.patientForm = this.patientFormInput as FormGroup;

    this.patientForm.updateValueAndValidity({ emitEvent: false });
    
    this.exclusions = this.dropdown.getExclusions();

    this.treatmentAreaNames$ = this.dropdown.getTreatmentAreas();

    this.hideIrrelevantProblems(this.animalType?.value);

    this.dropdown.getAnimalTypes().pipe(takeUntil(this.ngUnsubscribe))
                                  .subscribe(animalTypes => this.initialiseAnimalTypeDropdown(animalTypes));

    this.filteredProblems$ = combineLatest([this.problemInput?.valueChanges.pipe(startWith('')), this.problemsExclusions$]).pipe(map(inputs => {

      const problem = inputs[0];
      const exclusions = inputs[1];
        
      const cleanedProblem = (typeof problem === 'string' ? problem : problem?.Problem)?.toLowerCase() || "";

      return this.rawProblems?.filter(option => option.Problem.toLowerCase().indexOf(cleanedProblem) === 0)
                      .filter(problem => !(exclusions.includes(problem.Problem)))
                      .filter(problem => !(this.problemsArray?.value as Problem[]).map(problemArrayValue => problemArrayValue.problem)
                                                                                .includes(problem.Problem.trim()));
      

    
    }
      ));

    
    this.treatmentListService.admissionAcceptReject.pipe(takeUntil(this.ngUnsubscribe)).subscribe(patient => {

      if(this.patientForm?.get('patientId')?.value === patient.patientId) {
        this.patientForm?.get('admissionAccepted')?.setValue(patient.accepted);

        if(patient.accepted) {
          this.patientForm?.get('admissionArea')?.disable();
          this.snackbar.successSnackBar('Admission accepted', 'OK');
        }
        else {
          this.patientForm?.get('admissionArea')?.setValue('');
          this.snackbar.warningSnackBar('Admission rejected', 'OK');

        }
      }

    });

  }

  private initialiseAnimalTypeDropdown(animalTypes: AnimalType[]) {
    
    this.sortedAnimalTypes = animalTypes;
    this.animalType.setValidators(animalTypeValidator(this.sortedAnimalTypes));

    this.animalType.enable();

    this.animalType?.valueChanges.pipe(
      startWith(''),
      takeUntil(this.ngUnsubscribe),
      map(animalType => typeof animalType === 'string' ? animalType : animalType?.AnimalType))
      .subscribe(animalType => {

        this.filteredAnimalTypes$ = animalType ? this.animalFilter(animalType.toLowerCase()) : this.sortedAnimalTypes;

        if(this.animalType.invalid){
          this.problemInput.disable({ emitEvent: false });
        }
        else {
          this.problemInput.enable({ emitEvent: false });
          this.problemRef?.nativeElement.focus();
        }        

        if (animalType === '') {
          this.problemsArray.clear();
        }

      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngAfterViewInit(): void{

    this.patientForm?.get('problems')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((problems:Problem[]) => {
      if(this.problemChipGrid?.errorState){
        this.problemChipGrid.errorState = this.problemsArray.length === 0;
      }
      this.patientFormProblemSetError();
    });


    // this.problemAutoComplete?.panelClosingActions.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selection => {

    //   if(!selection){

    //     this.problemRef.nativeElement.value = '';
    //     this.problemRef.nativeElement.focus();

    //   }

    // });

    this.patientForm?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(patient => {
     /**
      * Hide deleted patient
      */
      this.patientDeletedFlag = patient.deleted;

    });


  }

  animalFilter(filterValue: string) : AnimalType[]{

    return this.sortedAnimalTypes
                  .sort((a,b) => a.SortOrder - b.SortOrder)
                  .filter(animalType => animalType.AnimalType.toLowerCase().indexOf(filterValue) === 0)
  }



  animalSelected(selectedAnimal: AnimalType) : void {

    this.currentPatientSpecies = selectedAnimal.AnimalType;

    this.patientForm?.get('animalType')?.setValue(selectedAnimal.AnimalType);
    this.patientForm?.get('animalTypeId')?.setValue(selectedAnimal.AnimalTypeId);

    this.patientForm?.get('updated')?.setValue(true);

    this.hideIrrelevantProblems(selectedAnimal.AnimalType);

    this.problemChipGrid.errorState = this.problemsArray.length === 0;
    this.patientFormProblemSetError();
  }

  remove(removeProblem:number){

    const problemIndex =  this.problemsArray.controls.findIndex( problem => problem.get('problemId')?.value === removeProblem);

    this.problemsArray.removeAt(problemIndex);
  }


  hideIrrelevantProblems(animal:string) {

    if(this.problemInput.disabled) return;

    const currentExclusions = this.exclusions.filter(animalType => animalType.animalType === animal);

    this.problemsExclusions$.next(currentExclusions[0]?.exclusionList || []);

  }

/**
 * Checks that the animal entered exists in the list of animals. If
 * not the user is alerted with a message
 * 
 * @returns void
 */
  isSpeciesBlank() : void{

    const currentAnimalValue = this.animalTypeInput.nativeElement.value.toLowerCase();

    if(!currentAnimalValue) return;

    const matchAnimalType = this.animalFilter(currentAnimalValue)
                                .find(animal => animal.AnimalType.toLowerCase() === currentAnimalValue);

    if(matchAnimalType){
      this.animalSelected(matchAnimalType);
      return;
    }

    const message = (this.animalType?.value).length > 0 ? 'Please enter a valid animal or select one from the list' : 'Please enter an animal'

    const dialogRef = this.dialog.open(ConfirmationDialog,{
      data:{
        title: 'Invalid selection',
        message: message,
        icon: 'warning',
        buttonText: {
          ok: 'OK',
          cancel: 'hide-cancel'
        }
      }
    });

    dialogRef.afterClosed()
    .pipe(takeUntil(this.animalTypeValueChangesUnsubscribe))
    .subscribe(() => {

      this.animalTypeInput.nativeElement.focus();
      this.problemAutoComplete.closePanel();

    });

  }


  checkMainProblem(){

    const problemRefElement = this.problemRef.nativeElement;

    if(this.problemsArray.length === 0){

      problemRefElement.value = '';
      this.problemChipGrid.errorState = true;

      this.patientFormProblemSetError();

    }
    //else {
    //  this.sortedProblems.pipe(map(problems => problems.map(problem => problem.Problem))).forEach(problems => {

    //    const matchProblem = problems.filter(problem => problem === problemRefElement.value.trim());

    //    if(matchProblem.length === 0){
    //      problemRefElement.value = '';
    //    }

    //  });
    //}
  }

  private patientFormProblemSetError() {

    if (this.problemChipGrid?.errorState === true) {
      this.patientForm?.setErrors({
        problemsRequired: true
      });
    }
    else {
      this.patientForm?.setErrors(null);
    }
  }

  openMediaDialog(patientForm:FormGroup){
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

  printEmergencyCard(patientForm:FormGroup){

    const printTemplateId = this.userOptions.getEmergencyCardTemplateId();

    if(patientForm.get('patientId')?.value){
      this.printService.printPatientDocument(printTemplateId, patientForm.get('patientId')?.value);
    }

  }

  deletePatient(){

    const dialogRef = this.dialog.open(ConfirmationDialog,{
      data:{
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Yes',
          cancel: 'No'
        }
      }
    });

    dialogRef.afterClosed()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((confirmed: boolean) => {
      if (confirmed) {
        if(this.patientForm?.get('patientId')?.value){
          this.patientForm?.get('deleted')?.setValue(true);
        }
        else {
          this.deletedPatientIndex.emit(this.patientForm?.get('patientId')?.value);
        }
      }
    });

  }

  tabPressed($event:Event, patientIndex: number) {
    $event.preventDefault();

    this.tagNumber.nativeElement.focus();

  }

  problemInputTokenEnd($event:MatChipInputEvent): void {    

    this.dropdown.getProblems().pipe(take(1)).subscribe(problemList => {

      const foundProblem = problemList.find(element => element.Problem?.trim().toLowerCase() === $event.value.trim().toLowerCase());

      if(!foundProblem) return;

      this.addProblemToProblemArray(foundProblem.ProblemId, foundProblem.Problem);      

    });

  }

  updatePatientProblemArray(event:MatAutocompleteSelectedEvent): void {

      const problemExists = this.problemsArray.controls.find(
        problem => problem.get('problem')?.value.trim().toLowerCase() === event.option?.value.Problem.trim().toLowerCase()
      );

      if(problemExists) return;

      this.addProblemToProblemArray(event.option?.value.ProblemId, event.option?.value.Problem);

  }

  private addProblemToProblemArray(problemId: number, problem: string) {

      const problemsGroup = this.fb.group({
        problemId: [problemId, Validators.required],
        problem: [problem, Validators.required],
      });

      this.problemsArray.push(problemsGroup);
      this.problemRef.nativeElement.value = "";
      this.problemInput.setValue(null);
      this.patientForm?.get('updated')?.setValue(true);
    
  }

  redoPatient(){
    this.patientForm?.get('deleted')?.setValue(false);
  }

  focusAnimalType(event:Event){
    event.preventDefault();
    this.animalTypeInput.nativeElement.focus();
  }

}
