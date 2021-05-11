import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, Validators, FormControl, FormGroup} from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipList } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';
import { AnimalType } from 'src/app/core/models/animal-type';
import { Exclusions, ProblemDropdownResponse } from 'src/app/core/models/responses';
import { TreatmentArea } from 'src/app/core/models/treatment-lists';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';

@Component({
  selector: 'app-emergency-register-patient',
  templateUrl: './emergency-register-patient.component.html',
  styleUrls: ['./emergency-register-patient.component.scss']
})
export class EmergencyRegisterPatientComponent implements OnInit,AfterViewInit {

  @Input() patientIndex!: number;
  @Input() patientFormInput!: any;
  @Input()
  set callOutcome(callOutcome: string) { this._callOutcome = callOutcome; }
  get callOutcome(): string { return this._callOutcome; }

  @Output() patientDeleted: EventEmitter<number> = new EventEmitter();

  @ViewChild('problemRef') problemRef!: ElementRef;
  @ViewChild('chipList', {static: false}) chipList!: MatChipList;
  @ViewChild('animalTypeInput') animalTypeInput!: ElementRef;
  @ViewChild('tagNumber') tagNumber!: ElementRef;
  @ViewChild('animalTypeInput', { read: MatAutocompleteTrigger }) animalAutoComplete! : MatAutocompleteTrigger;
  @ViewChild('problemRef', { read: MatAutocompleteTrigger }) problemAutoComplete!: MatAutocompleteTrigger;

  animalType!: AbstractControl;
  private _callOutcome = '';

  private animalTypeValueChangesUnsubscribe = new Subject();
  currentPatientSpecies: string | undefined;
  errorMatcher = new CrossFieldErrorMatcher();
  exclusions: Exclusions[] = [] as Exclusions[];

  filteredAnimalTypes$!:Observable<AnimalType[]>;
  filteredProblems$!: Observable<ProblemDropdownResponse[]>;

  patientForm!: FormGroup;
  problemInput = new FormControl();
  problemsArray!: FormArray;
  problemsExclusions!: string[];

  removable = true;
  selectable = true;

  sortedAnimalTypes = this.dropdown.getAnimalTypes().pipe(
    map(animalTypes => animalTypes.sort((a,b) => (a.AnimalType > b.AnimalType) ? 1 : ((b.AnimalType > a.AnimalType) ? -1 : 0))),
  );

  sortedProblems = this.dropdown.getProblems().pipe(
    map( problems =>
      {
        const selectedProblems =  this.problemsArray?.value as {problemId: number, problem: string}[];
        const problemsArray = selectedProblems.map((problemOption:{problemId: number, problem: string}) => problemOption.problem?.trim());
        return problems.filter(problem => !problemsArray.includes(problem.Problem.trim()));
      }
    ),
    map(problems => problems.sort((a,b) => (a.Problem > b.Problem) ? 1 : ((b.Problem > a.Problem) ? -1 : 0)))
  );

  treatmentAreaNames$!: Observable<TreatmentArea[]>;



  constructor(
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private printService: PrintTemplateService,
    private userOptions: UserOptionsService,
  ) {


   }

  ngOnInit(): void {

    this.patientForm = this.patientFormInput as FormGroup;

    this.exclusions = this.dropdown.getExclusions();

    this.treatmentAreaNames$ = this.dropdown.getTreatmentAreas();

    this.animalType = this.patientForm?.get('animalType') as AbstractControl;


    this.filteredAnimalTypes$ = this.animalType?.valueChanges.pipe(
      startWith(''),
      map(animalType => typeof animalType === 'string'? animalType : animalType?.AnimalType),
      switchMap((animalType:string) => animalType ? this.animalFilter(animalType.toLowerCase()) : this.sortedAnimalTypes)
    );


    this.filteredProblems$ = this.problemInput.valueChanges.pipe(
      startWith(''),
      map(problem => typeof problem === 'string' ? problem : problem.Problem),
      switchMap((problem:string) => problem ? this.problemFilter(problem.toLowerCase()): this.sortedProblems),
    );

    this.problemsArray = this.patientForm?.get('problems') as FormArray;

    setTimeout(()=>{
      if(this.chipList.errorState){
        this.chipList.errorState = this.problemsArray.length > 0 ? false : true;
      }
    },1);

    

  }



  animalTypeChangessub(){
    this.animalType.valueChanges.pipe(takeUntil(this.animalTypeValueChangesUnsubscribe)).subscribe(animalType => {
      if(animalType === ''){
        this.problemsArray.clear();
      }
    });
  }

  animalTypeChangesUnsub(){
    this.animalTypeValueChangesUnsubscribe.next();
    this.animalTypeValueChangesUnsubscribe.complete();
  }
  ngAfterViewInit(): void{

    this.patientForm.get('problems')?.valueChanges.subscribe((problems:{problemId: 1, problem: 'Abdominal swelling'}[]) => {
      if(this.chipList.errorState){
        this.chipList.errorState = false ;
      }
    });

    // When the animal selection panel closes, if no animal has been selected, then clear the value
    this.animalAutoComplete.panelClosingActions.subscribe(selection => {
      if(!selection){
          this.animalType?.setValue('');
          this.animalTypeInput.nativeElement.value = '';
          this.animalTypeInput.nativeElement.focus();
      }

    });

    this.problemAutoComplete.panelClosingActions.subscribe(selection => {

      if(!selection){
        this.problemRef.nativeElement.value = '';
        this.problemRef.nativeElement.focus();
      }

    });

  }

  animalFilter(fitlerValue: string){

    return this.dropdown.getAnimalTypes().pipe(
      map(animalTypes => animalTypes.filter(animalType => animalType.AnimalType.toLowerCase().indexOf(fitlerValue) === 0)),
      map(animalTypes => animalTypes.sort((a,b) => (a.AnimalType > b.AnimalType) ? 1 : ((b.AnimalType > a.AnimalType) ? -1 : 0)))
    );
  }

  problemFilter(filterValue:string) {

    return this.dropdown.getProblems().pipe(
      map(problems => problems.filter(option => option.Problem.toLowerCase().indexOf(filterValue) === 0)),
      map(problems => {

        const selectedProblems =  this.problemsArray?.value as {problemId: number, problem: string}[];

         if(selectedProblems.length > 0){

            const problemsArray = selectedProblems.map((problemOption:{problemId: number, problem: string}) => problemOption.problem.trim());
            const filteredProblemsArray = problems.filter(problem => !problemsArray.includes(problem.Problem.trim()));
            return filteredProblemsArray;

        }else{
            return problems;
        }
      }),
      map(problems => problems.sort((a,b) => (a.Problem > b.Problem) ? 1 : ((b.Problem > a.Problem) ? -1 : 0))),
      map(problems => this.problemsExclusions ? problems.filter(problem => !this.problemsExclusions.includes(problem.Problem.trim())):problems)
    );
  }

  animalSelected($event:MatAutocompleteSelectedEvent):void {

    this.currentPatientSpecies = $event.option.viewValue;

    this.patientForm.get('animalType')?.setValue($event.option.viewValue);
    this.patientForm.get('animalTypeId')?.setValue($event.option?.value.AnimalTypeId);

    this.patientForm.get('updated')?.setValue(true);

    this.hideIrrelevantProblems($event.option.viewValue);
    this.problemsArray.length === 0 ? this.chipList.errorState = true : this.chipList.errorState = false;
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
      this.patientForm.get('updated')?.setValue(true);
    }
    this.problemRef.nativeElement.value = '';
  }

  remove(removeProblem:number){

    const problemIndex =  this.problemsArray.controls.findIndex( problem => problem.get('problemId')?.value === removeProblem);

    this.problemsArray.removeAt(problemIndex);
  }

  hideIrrelevantProblems(animal:string) {

    const currentExclusions = this.exclusions.filter(animalType => animalType.animalType === animal);

    // Get the current patient and check if we're swtiching between animal chips, because if so we'll receive 3 calls,
    // two for the new patient type, followed by an unset for the old patient type


    if(!(this.patientForm.get('animalType')?.value === animal)){
        return;
    }
    this.problemsExclusions = currentExclusions[0]?.exclusionList;

  }


  isSpeciesBlank($event:Event){

   setTimeout(() =>{

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
        // .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((confirmed: boolean) => {

          $event.preventDefault();
          this.animalTypeInput.nativeElement.focus();
          this.problemAutoComplete.closePanel();

          });


      }
   },0);
  }


  checkMainProblem(){
    const problemRefElement = this.problemRef.nativeElement;
    if(this.problemsArray.length === 0){
      problemRefElement.value = '';
      this.chipList.errorState = true;
    }else{
      this.sortedProblems.pipe(map(problems => problems.map(problem => problem.Problem))).forEach(problems => {
        const matchProblem = problems.filter(problem => problem === problemRefElement.value.trim());
        if(matchProblem.length === 0){
          problemRefElement.value = '';
        }
      });
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

  deletePatient(event: Event, patientIndex: number){
    this.patientDeleted.emit(patientIndex);
  }

}
