import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, Validators, FormControl, FormGroup} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipList } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { MediaDialogComponent } from 'src/app/core/components/media-dialog/media-dialog.component';
import { AnimalType } from 'src/app/core/models/animal-type';
import { MediaItem } from 'src/app/core/models/media';
import { Exclusions,ProblemDropdownResponse } from 'src/app/core/models/responses';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';	
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';

@Component({
  selector: 'app-emergency-register-patient',
  templateUrl: './emergency-register-patient.component.html',
  styleUrls: ['./emergency-register-patient.component.scss']
})
export class EmergencyRegisterPatientComponent implements OnInit {

  @Input() patientIndex!: number;
  @Input() patientForm!: any;

  @Output() patientDeleted: EventEmitter<number> = new EventEmitter();

  private _callOutcome = '';
  @Input()
  set callOutcome(callOutcome: string) {
    this._callOutcome = callOutcome;
  }
 
  get callOutcome(): string { return this._callOutcome; }
  
  @ViewChild('problemRef') problemRef!: ElementRef;
  @ViewChild('chipList',{static: false}) chipList!: MatChipList;

  
  problemInput = new FormControl();

  errorMatcher = new CrossFieldErrorMatcher();

  currentPatientSpecies: string | undefined;

  animalType!: AbstractControl;

  exclusions: Exclusions[] = [] as Exclusions[];
  problemsExclusions!: string[];

  filteredAnimalTypes$!:Observable<AnimalType[]>;
  filteredProblems$!: Observable<ProblemDropdownResponse[]>;

  problemsArray!: FormArray;
 

  sortedAnimalTypes = this.dropdown.getAnimalTypes().pipe(
    map(animalTypes => animalTypes.sort((a,b) => (a.AnimalType > b.AnimalType) ? 1 : ((b.AnimalType > a.AnimalType) ? -1 : 0))),
  );

  sortedProblems = this.dropdown.getProblems().pipe(
    map(problems => problems.sort((a,b) => (a.Problem > b.Problem) ? 1 : ((b.Problem > a.Problem) ? -1 : 0)))
  );

  selectable = true;
  removable = true;

  constructor(
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private printService: PrintTemplateService,
    private userOptions: UserOptionsService,
  ) { }


  ngOnInit(): void {

    this.exclusions = this.dropdown.getExclusions();


    this.animalType = this.patientForm.get('animalType') as AbstractControl;
    this.filteredAnimalTypes$ = this.animalType.valueChanges.pipe(
      startWith(''),
      map(animalType => typeof animalType === 'string'? animalType : animalType.AnimalType),
      switchMap((animalType:string) => animalType ? this.animalFilter(animalType.toLowerCase()) : this.sortedAnimalTypes)
    );

    this.filteredProblems$ = this.problemInput.valueChanges.pipe(
      startWith(''),
      map(problem => typeof problem === 'string' ? problem : problem.Problem),
      switchMap((problem:string) => problem ? this.problemFilter(problem.toLowerCase()): this.sortedProblems),
    );
    this.problemsArray = this.patientForm.get('problems') as FormArray;
    

    setTimeout(()=>{                           
      this.chipList.errorState = true;
    }, 1);
    
  }
  ngAfterViewInit(): void{
    
    this.patientForm.get('problems').valueChanges.subscribe((problems:{problemId: 1, problem: "Abdominal swelling"}[]) => {
      this.chipList.errorState = false ;
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
    this.patientForm.get('animalTypeId')?.setValue($event.option.value);
    this.patientForm.get('updated')?.setValue(true);

    this.hideIrrelevantProblems($event.option.viewValue); 

  }  

  updatePatientProblemArray(event :MatAutocompleteSelectedEvent): void {
   
    const problemsGroup = this.fb.group({
        problemId: [event.option.value, Validators.required],
        problem: [event.option.viewValue, Validators.required],
    });

    const problemIndex = this.problemsArray.controls.findIndex(
        problem =>
            problem.get('problemId')?.value === event.option.value,
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


  isSpeciesBlank(){
    this.animalType.value === '' ? alert('Please select an animal') : '' ;
  }


  openMediaDialog(mediaObject:MediaItem){
    // this is never going to work where is MediaItem and even typescript take it as mediaItem idiot their is no mediaItem
    const dialogRef = this.dialog.open(MediaDialogComponent, {
      minWidth: '50%',
      data: {
          tagNumber: this.patientForm.get('tagNumber')?.value,
          patientId: this.patientForm.get('patientId')?.value,
          mediaItem: mediaObject
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
