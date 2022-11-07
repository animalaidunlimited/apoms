import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, Validators, FormControl, FormGroup} from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipList } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';
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

  private _callOutcome = '';

  @Input() outcome!: boolean;

  @Output() problemTab:EventEmitter<boolean> = new EventEmitter();
  @Output() deletedPatientIndex:EventEmitter<number> = new EventEmitter();

  @ViewChild('problemRef') problemRef!: ElementRef;
  @ViewChild('chipList', {static: false}) chipList!: MatChipList;
  @ViewChild('animalTypeInput') animalTypeInput!: ElementRef;
  @ViewChild('tagNumber') tagNumber!: ElementRef;
  @ViewChild('animalTypeInput', { read: MatAutocompleteTrigger }) animalAutoComplete! : MatAutocompleteTrigger;
  @ViewChild('problemRef', { read: MatAutocompleteTrigger }) problemAutoComplete!: MatAutocompleteTrigger;

  get animalType() { return this.patientForm?.get('animalType') as FormControl; };
  get problemsArray() { return this.patientForm?.get('problems') as FormArray };

  private animalTypeValueChangesUnsubscribe = new Subject();

  currentPatientSpecies: string | undefined;
  errorMatcher = new CrossFieldErrorMatcher();
  exclusions: Exclusions[] = [] as Exclusions[];

  filteredAnimalTypes$!:AnimalType[];
  filteredProblems$!: Observable<ProblemDropdownResponse[]>;

  patientDeletedFlag = false;
  patientForm: FormGroup = new FormGroup({});
  problemInput = new FormControl();
  problemsExclusions$ = new BehaviorSubject<string[]>(['']);

  removable = true;
  selectable = true;

  sortedAnimalTypes!: AnimalType[];

  sortedProblems = this.dropdown.getProblems().pipe(
    map( problems =>
      {
        const selectedProblems =  this.problemsArray?.value as Problem[];
        const problemsArray = selectedProblems.map((problemOption:Problem) => problemOption.problem?.trim());

        let p = problems.filter(problem => !problemsArray.includes(problem.Problem.trim()) && !(this.problemsExclusions$.value).includes(problem.Problem.trim()));

        return p;
      }
    ),
    map(problems => problems.sort((a,b) => (a.Problem > b.Problem) ? 1 : ((b.Problem > a.Problem) ? -1 : 0)))
  );


  treatmentAreaNames$!: Observable<TreatmentArea[]>;

  constructor(
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private treatmentListService: TreatmentListService,
    private printService: PrintTemplateService,
    private userOptions: UserOptionsService,
    private snackbar: SnackbarService
  ) {


   }

  ngOnInit(): void {    

    this.patientForm = this.patientFormInput as FormGroup;

    this.patientForm.updateValueAndValidity({ emitEvent: false });
    
    this.exclusions = this.dropdown.getExclusions();

    this.treatmentAreaNames$ = this.dropdown.getTreatmentAreas();

    this.hideIrrelevantProblems(this.animalType?.value);

    this.dropdown.getAnimalTypes().pipe(takeUntil(this.ngUnsubscribe))
                                  .subscribe(animalTypes => this.initialiseAnimalTypeDropdown(animalTypes));


    // this.filteredAnimalTypes$ = this.animalType?.valueChanges.pipe(
    //  takeUntil(this.ngUnsubscribe),
    //  startWith(''),
    //  map(animalType => typeof animalType === 'string'? animalType : animalType?.AnimalType),
    //  switchMap((animalType:string) =>
    //    animalType ? of(this.animalFilter(animalType.toLowerCase())) : of(this.sortedAnimalTypes)
    //  )
    // );
    
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

      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  animalTypeChangesSub(){

    this.animalType?.valueChanges.pipe(takeUntil(this.animalTypeValueChangesUnsubscribe)).subscribe(animalType => {

      this.animalType.invalid ?
        this.problemInput.disable({emitEvent: false})
        :
        this.problemInput.enable({emitEvent: false});

      if(animalType === ''){
        this.problemsArray.clear();
      }
    });

  }

  animalTypeChangesUnsub(){

    //this.isSpeciesBlank();

    this.animalTypeValueChangesUnsubscribe.next();
    this.animalTypeValueChangesUnsubscribe.complete();
  }



  ngAfterViewInit(): void{

    this.patientForm?.get('problems')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((problems:Problem[]) => {
      if(this.chipList?.errorState){
        this.chipList.errorState = this.problemsArray.length === 0;
      }
      this.patientFormProblemSetError();
    });


    this.problemAutoComplete?.panelClosingActions.pipe(takeUntil(this.ngUnsubscribe)).subscribe(selection => {

      if(!selection){

        this.problemRef.nativeElement.value = '';
        this.problemRef.nativeElement.focus();

      }

    });

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


  problemFilter(filterValue:string) : Observable<ProblemDropdownResponse[]>{

    return this.dropdown.getProblems().pipe(
      map(problems => problems.filter(option => option.Problem.toLowerCase().indexOf(filterValue) === 0)),
      map(problems => {

        const selectedProblems =  this.problemsArray?.value as Problem[];

        if(selectedProblems.length > 0){

          const problemsArray = selectedProblems.map((problemOption:Problem) => problemOption.problem.trim());
          const filteredProblemsArray = problems.filter(problem => !problemsArray.includes(problem.Problem.trim()));

          return filteredProblemsArray;

        }else{
          return problems;
        }

      }),
      map(problems => problems.filter(problem => !(this.problemsExclusions$.value).includes(problem.Problem.trim()))),
      map(problems => problems.sort((a,b) => (a.Problem > b.Problem) ? 1 : ((b.Problem > a.Problem) ? -1 : 0))));
  }


  animalSelected($event:MatAutocompleteSelectedEvent):void {

    this.currentPatientSpecies = $event.option.viewValue;

    this.patientForm?.get('animalType')?.setValue($event.option.viewValue);
    this.patientForm?.get('animalTypeId')?.setValue($event.option?.value.AnimalTypeId);

    this.patientForm?.get('updated')?.setValue(true);

    this.hideIrrelevantProblems($event.option.viewValue);

    this.problemsArray.length === 0 ? this.chipList.errorState = true : this.chipList.errorState = false;
    this.patientFormProblemSetError();
  }

  updatePatientProblemArray(event :MatAutocompleteSelectedEvent): void {

    const problemsGroup = this.fb.group({
        problemId: [event.option?.value, Validators.required],
        problem: [event.option.viewValue, Validators.required],
    });

    const problemIndex = this.problemsArray.controls.findIndex(
        problem =>
            problem.get('problemId')?.value === event?.option.value,
    );

    if (problemIndex === -1) {
      this.problemsArray.push(problemsGroup);
      this.patientForm?.get('updated')?.setValue(true);
    }
    this.problemRef.nativeElement.value = '';
  }

  remove(removeProblem:number){

    const problemIndex =  this.problemsArray.controls.findIndex( problem => problem.get('problemId')?.value === removeProblem);

    this.problemsArray.removeAt(problemIndex);
  }

  hideIrrelevantProblems(animal:string) {

    this.filteredProblems$ = this.problemInput?.valueChanges.pipe(
      startWith(''),
      map(problem => typeof problem === 'string' ? problem : problem.Problem),
      switchMap((problem:string) => {

        return problem ? this.problemFilter(problem.toLowerCase()) : this.sortedProblems;
      })
    );

    const currentExclusions = this.exclusions.filter(animalType => animalType.animalType === animal);

    // Get the current patient and check if we're switching between animal chips, because if so we'll receive 3 calls,
    // two for the new patient type, followed by an unset for the old patient type

    if(!(this.patientForm?.get('animalType')?.value === animal)){
        return;
    }

    this.problemsExclusions$.next(currentExclusions[0]?.exclusionList || []);


  }


  isSpeciesBlank(){


      if(this.animalType?.value === '')
      {
        const dialogRef = this.dialog.open(ConfirmationDialog,{
          data:{
            message: 'Please select an animal',
            title: 'Invalid selection',
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
      else{

          const matchAnimalType = this.animalFilter(this.animalTypeInput.nativeElement.value.toLowerCase())
                                        .findIndex(animal => animal.AnimalType.toLowerCase() === this.animalTypeInput.nativeElement.value.toLowerCase());

          // if no animal has been selected, then clear the value
          if(matchAnimalType === -1){
            this.animalType?.setValue('');
            this.animalTypeInput.nativeElement.value = '';
            //this.filteredProblems$ = this.problemFilter('');
          }
          else{
            this.problemRef.nativeElement.focus();

          }
        }

  }


  checkMainProblem(){

    const problemRefElement = this.problemRef.nativeElement;

    if(this.problemsArray.length === 0){

      problemRefElement.value = '';
      this.chipList.errorState = true;

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
    if (this.chipList?.errorState === true) {
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

  problemTabPressed($event:Event){
    $event.preventDefault();

    this.problemTab.emit(true);

  }

  redoPatient(){
    this.patientForm?.get('deleted')?.setValue(false);
  }

  focusAnimalType(event:Event){
    event.preventDefault();
    this.animalTypeInput.nativeElement.focus();
  }

}
