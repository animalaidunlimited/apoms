import { Component, ViewChild, OnInit, Input } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTable }  from '@angular/material/table';
import { MatChip, MatChipList, MatDialog } from '@angular/material';
import { TagNumberDialog } from '../tag-number-dialog/tag-number-dialog.component';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { AnimalType } from 'src/app/core/models/animal-type';
import { UniqueTagNumberValidator } from 'src/app/core/validators/tag-number.validator';
import { Problem } from 'src/app/core/models/problem';
import { Patient } from 'src/app/core/models/patients';






@Component({
  selector: 'animal-selection',
  templateUrl: './animal-selection.component.html',
  styleUrls: ['./animal-selection.component.scss']
})

export class AnimalSelectionComponent implements OnInit{

  //I used animalTypes$ instead of animalType here to make the ngFors more readable (let specie(?) of animalType )
  animalTypes$: AnimalType[];
  problems$: Problem[];
  exclusions;

  @ViewChild(MatTable, {static: true}) patientTable: MatTable<any>;
  @ViewChild('animalTypeChips', {static: true}) animalTypeChips: MatChipList;
  @ViewChild('problemChips', {static: true}) problemChips: MatChipList;
  @Input() recordForm: FormGroup;

  patientArrayDisplayedColumns: string[] = ["select", "animalType", "mainProblem", "tagNo", "delete"];

  patientArray:FormArray;
  currentPatientChip = "";

  patientDataSource:MatTableDataSource<any>;
  selection;
  tagNumber: string;

  constructor(public dialog: MatDialog,
    private fb: FormBuilder,
    private tagNumberValidator: UniqueTagNumberValidator,
    private dropdown: DropdownService) {}

  ngOnInit()
  {
    this.initPatientArray();



    this.dropdown.getAnimalTypes().subscribe(animalTypes => this.animalTypes$ = animalTypes);

    this.dropdown.getProblems().subscribe(problems => this.problems$ = problems);

    this.exclusions = this.dropdown.getExclusions();

    this.recordForm.get("patients").valueChanges.subscribe(items => {

    if(items){

      if(items[0].patientId == null &&
        items[0].position == null
          ){
            console.log("Here")
            this.initPatientArray();
            this.clearChips();

          }
    }
  });


  }

  initPatientArray()
  {
    let patient = this.fb.group({
      patientId: [null],
      position: [''],
      animalTypeId: [''],
      animalType: [''],
      problems: this.fb.array([]),
      problemsString:['', Validators.required],
      tagNumber: ['', ,this.tagNumberValidator.validate()],
      duplicateTag: [false, Validators.required],
      updated: [true, Validators.required],
      deleted: [false, Validators.required]
    });

    patient.get('position').setValue(1);

    this.patientArray = this.recordForm.get('patients') as FormArray;

    this.patientArray.clear();

    this.patientArray.push(patient);

    let patients = (this.recordForm.get('patients') as FormArray).controls;

    this.patientDataSource = new MatTableDataSource(patients);

    this.selection = new SelectionModel<any>(false, [this.patientDataSource.data[0]]);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
      const numSelected = this.selection.selected.length;
      const numRows = this.patientDataSource.data.length;
      return numSelected === numRows;
  }

  toggleRow(row)
  {
    // setTimeout(() => {
    this.selection.toggle(row);
    this.clearChips();

      this.selection.selected.length != 0 ? this.reloadChips(this.getcurrentPatient()) : null
    // });


  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
      this.isAllSelected() ?
      this.selection.clear() :
      this.patientDataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Patient): string {
      if (!row) {
        return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
      }
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  clearChips()
  {

    this.currentPatientChip = "";

    //Get all of the chip lists on the page and reset them all.
    this.animalTypeChips.chips.forEach(chip =>
    {
      chip.selected = false;
      chip.disabled = false;
      chip.selectable = true;
    });

    this.problemChips.chips.forEach(chip =>
    {
      chip.selected = false;
      chip.disabled = false;
      chip.selectable = true;
    });

  }

  reloadChips(currentPatient)
  {

      this.animalTypeChips.chips.forEach(chip => {

        currentPatient.get("animalType").value == chip.value ? chip.toggleSelected() : null;
        this.currentPatientChip = chip.value;

      });


      let problems:FormArray = currentPatient.get('problems');

      problems.controls.forEach(problem => {

        this.problemChips.chips.forEach(chip => {

        problem.get('problem').value == chip.value ? chip.toggleSelected() : null;

        });
      });

  }

  toggleAnimalChip(animalTypeChip)
  {
    this.animalChipSelected(animalTypeChip);
  }

  animalChipSelected(animalTypeChip)
  {
    this.currentPatientChip = "";

    var selectedCount:number = this.selection.selected.length;

    if(selectedCount > 1)
    {
      alert("Please select only one animal in the table to change");
      return;
    }

    if(selectedCount == 1 && (animalTypeChip.selected ||
      !(this.animalTypeChips.selected instanceof MatChip)))
    {
    //There is only 1 row selected, so we can update the animal for that row
    let animalTypeObject;

    animalTypeObject = this.getAnimalFromObservable(animalTypeChip.value);

    let currentPatient = this.getcurrentPatient();

    currentPatient.get("animalType").setValue(animalTypeChip.selected ? animalTypeObject.AnimalType : null);
    currentPatient.get("animalTypeId").setValue(animalTypeChip.selected ? animalTypeObject.AnimalTypeId : null);

    this.currentPatientChip = animalTypeChip.value;

    this.patientTable.renderRows();

    this.hideIrrelevantChips(animalTypeChip);

    }

    //if there are no rows, then we need to add a new one
    if(selectedCount == 0 && animalTypeChip.selected)
    {

      this.currentPatientChip = animalTypeChip.value;

      let currentPatient = this.getAnimalFromObservable(this.currentPatientChip);

        let position:number = (this.patientDataSource.data.length + 1);

        let newPatient = this.fb.group(
          {
            patientId: [null],
            position: [position, Validators.required],
            animalTypeId: [currentPatient.AnimalTypeId, Validators.required],
            animalType: [currentPatient.AnimalType, Validators.required],
            problems: this.fb.array([]),
            problemsString: ['', Validators.required],
            tagNumber: [''],
            duplicateTag: [false, Validators.required],
            updated: [true, Validators.required],
            deleted: [false, Validators.required]
          });
        this.patientArray.push(newPatient);

        this.patientTable.renderRows();

        //Set the new row to be selected
        this.selection.select(this.patientDataSource.data.find(row =>
           row.get("position").value == position
           ));

      this.hideIrrelevantChips(animalTypeChip);
    }

  }

  cycleChips(key)
  {
      if(key.match(/^[A-Za-z]+$/))
      {
        let currentPatient = this.getcurrentPatient().animalType || "";

        let chips = this.animalTypeChips.chips;

        let lastInstance = "";
        let currentIndex;

        //Get the last value of the current key (e.g. last animal beginning with p)
        //Also get the index of the current item
        chips.forEach((item, index) => {
          if(item.value.substr(0,1).toLowerCase() == currentPatient.substr(0,1).toLowerCase())
          {
            lastInstance =  item.value;
          }

          if(item.value == currentPatient)
          {
            currentIndex = index;
          }

        })

        //Filter out any previous records so we can go directly to the next one in the list
        let currentArray = chips.filter((chip, index) => {

          return !(chip.value.substr(0,1).toLowerCase() == currentPatient.substr(0,1).toLowerCase()
          && index <= currentIndex)
          || currentPatient == ""
          || lastInstance == currentPatient

        })

        //Get the chip we need
        let currentKeyChip = currentArray.find(chip => {
          return chip.value.substr(0,1).toLowerCase() == key.toLowerCase()
        });

        currentKeyChip.selected = true;
      }

  }

  problemChipSelected(problemChip)
  {

    if(!problemChip.selectable && problemChip.selected)
    {
      problemChip.selected = false;
      return;
    }

    if(this.currentPatientChip == "" && !(this.animalTypeChips.selected instanceof MatChip))
    {
      alert("Please select an animal");
      problemChip.selected = false;
      return;
    }
    else{

      this.updatePatientProblemArray(problemChip);

    }

  }

  hideIrrelevantChips(animalTypeChip)
  {

    let currentExclusions = this.exclusions.filter(animalType =>
      animalType.animalType == animalTypeChip.value);

    this.problemChips.chips.forEach(chip => {


      chip.disabled = false;
      chip.selectable = true;

    });

    if(!animalTypeChip.selected)
    {
      return;
    }

    currentExclusions[0].exclusionList.forEach(exclusion =>

      this.problemChips.chips.forEach(chip => {

        if(chip.value === exclusion)
        {
          chip.disabled = true;
          chip.selectable = false;
          chip.selected = false;

          this.updatePatientProblemArray(chip);

        }
      })
    );

  }

  getcurrentPatient()
  {
    return this.selection.selected[0];
  }

  deletePatientRow(row)
  {

    let position = row.get("position").value;

    let deleted = row.get("deleted").value

    this.patientArray.controls[position - 1].get("deleted").setValue(!deleted);

    this.clearChips();

    this.patientTable.renderRows();

    this.selection.clear();

  }

  updatePatientProblemArray(problemChip)
  {
    //Get the current list of problems and replace the existing problem array

    let problemsObject:Problem = this.problems$.find(item =>
      item.Problem == problemChip.value
      );

    let problemsGroup = this.fb.group({
      problemId: [problemsObject.ProblemId, Validators.required],
      problem: [problemsObject.Problem, Validators.required]
    });

    let currentPatient:FormGroup = this.getcurrentPatient();

    //If the problem chip has been selected we need to add it to the problem array of the animal
    //else we need to find this problem in the array and remove it.

    let problems:FormArray = currentPatient.get('problems') as FormArray;

    let problemIndex = problems.value.findIndex(problem =>
        problem.problemId == problemsObject.ProblemId)


    problemChip.selected ?
      problems.push(problemsGroup)
      :
      problemIndex == -1 ? null : problems.removeAt(problemIndex);

    currentPatient.get("problemsString").setValue(problems.controls.map(problem =>
        problem.get("problem").value).join(","));

    this.patientTable.renderRows();
  }

  updateTag(currentPatient)
  {
    this.selection.isSelected(currentPatient) ? null : this.toggleRow(currentPatient);

    this.openDialog(currentPatient.value);
  }

  openDialog(event): void {

    let currentPatient:Patient = event;

    const dialogRef = this.dialog.open(TagNumberDialog, {
      width: '250px',
      data: {tagNumber: currentPatient.tagNumber, duplicateTag: currentPatient.duplicateTag}
    });

    dialogRef.afterClosed().subscribe(result => {

      if(result.value != null)
      {
        let currentPatient:FormGroup = this.getcurrentPatient();
        currentPatient.get("tagNumber").setValue(result.value);
        currentPatient.get("duplicateTag").setValue(result.status == "VALID" ? true : false);

        this.patientTable.renderRows();
      }
    });
  }

  getAnimalFromObservable(name: string)
  {
    return this.animalTypes$.find(animalType => animalType.AnimalType == name);
  }

}
