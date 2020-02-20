import { Component, ViewChild, OnInit, Input } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTable }  from '@angular/material/table';
import { MatChip, MatChipList, MatDialog } from '@angular/material';
import { TagNumberDialog } from '../tag-number-dialog/tag-number-dialog.component';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { AnimalType } from 'src/app/core/models/animal-type';

export interface Problem {
  id: number;
  problem: string;
  problemStripped: string;
  }

  export interface Animal {
    position: number;
    animalTypeId: number;
    animalType: string;
    problems: Problem[];
    problemsString: string;
    tagNumber: string;
  }

@Component({
  selector: 'animal-selection',
  templateUrl: './animal-selection.component.html',
  styleUrls: ['./animal-selection.component.scss']
})

export class AnimalSelectionComponent implements OnInit{

  //I used animalTypes$ instead of animalType here to make the ngFors more readable (let specie(?) of animalType )
  animalTypes$: AnimalType[];
  problems: Problem[];
  exclusions;

  @ViewChild(MatTable, {static: true}) animalTable: MatTable<any>;
  @ViewChild('animalTypeChips', {static: true}) animalTypeChips: MatChipList;
  @ViewChild('problemChips', {static: true}) problemChips: MatChipList;
  @Input() recordForm: FormGroup;

  animalArrayDisplayedColumns: string[] = ["select", "animalType", "mainProblem", "tagNo", "delete"];

  animalArray:FormArray;
  currentAnimalChip = "";

  animalDataSource:MatTableDataSource<any>;
  selection;
  tagNumber: string;

  constructor(public dialog: MatDialog,
    private fb: FormBuilder,
    private dropdown: DropdownService) {}

  ngOnInit()
  {
    this.initAnimalArray();

    this.animalDataSource = new MatTableDataSource((this.recordForm.get('animals') as FormArray).controls);

    this.selection = new SelectionModel<any>(false, [this.animalDataSource.data[0]]);

    this.dropdown.getAnimalTypes().subscribe(animalTypes => this.animalTypes$ = animalTypes);

    this.problems = this.dropdown.getProblems();
    this.exclusions = this.dropdown.getExclusions();
  }

  initAnimalArray()
  {
    let animal = this.fb.group({
      position: [''],
      animalTypeId: [''],
      animalType: [''],
      problems: this.fb.array([]),
      problemsString:['', Validators.required],
      tagNumber: ['']
    });

    animal.get('position').setValue(1);

    this.animalArray = this.recordForm.get('animals') as FormArray;

    this.animalArray.push(animal);
  }

  openDialog(currentAnimal): void {

    const dialogRef = this.dialog.open(TagNumberDialog, {
      width: '250px',
      data: {tagNumber: currentAnimal.tagNumber}
    });

    dialogRef.afterClosed().subscribe(result => {

      if(result != null)
      {
        let currentAnimal = this.getCurrentAnimal();
        currentAnimal.tagNumber = result;
      }

    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
      const numSelected = this.selection.selected.length;
      const numRows = this.animalDataSource.data.length;
      return numSelected === numRows;
  }

  toggleRow(row)
  {

    this.selection.toggle(row);
    this.clearChips();
    this.selection.selected.length != 0 ? this.reloadChips(this.getCurrentAnimal()) :
    null;


  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
      this.isAllSelected() ?
      this.selection.clear() :
      this.animalDataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Animal): string {
      if (!row) {
        return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
      }
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  clearChips()
  {

    this.currentAnimalChip = "";

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

  reloadChips(currentAnimal)
  {

    this.animalTypeChips.chips.forEach(chip => {

      currentAnimal.animalType == chip.value ? chip.toggleSelected() : null;
      this.currentAnimalChip = chip.value;

    });

    let problems:FormArray = currentAnimal.get('problems');

    problems.controls.forEach(problem => {

      this.problemChips.chips.forEach(chip => {

      problem.get('problem').value == chip.value ? chip.toggleSelected() : null;

      });
    });
  }

  toggleAnimalChip(animalTypeChip)
  {
    //Wait for the next tick until evrything is updated.
    setTimeout(() =>
    this.animalChipSelected(animalTypeChip)
  )

  }

  animalChipSelected(animalTypeChip)
  {
    this.currentAnimalChip = "";

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

    let currentAnimal = this.getCurrentAnimal();

    currentAnimal.get("animalType").setValue(animalTypeChip.selected ? animalTypeObject.AnimalType : null);
    currentAnimal.get("animalTypeId").setValue(animalTypeChip.selected ? animalTypeObject.AnimalTypeId : null);

    this.currentAnimalChip = animalTypeChip.value;

    this.animalTable.renderRows();

    this.hideIrrelevantChips(animalTypeChip);

    }

    //if there are no rows, then we need to add a new one
    if(selectedCount == 0 && animalTypeChip.selected)
    {

      this.currentAnimalChip = animalTypeChip.value;

      let currentAnimal = this.getAnimalFromObservable(this.currentAnimalChip);


      //this.animalTypes$.pipe(filter(type => type.AnimalType == this.currentAnimalChip));

        let position:number = (this.animalDataSource.data.length + 1);

        let newAnimal = this.fb.group(
          {
            position: [position, Validators.required],
            animalTypeId: [currentAnimal.AnimalTypeId, Validators.required],
            animalType: [currentAnimal.AnimalType, Validators.required],
            problems: this.fb.array([]),
            problemsString: ['', Validators.required],
            tagNumber: ['']
          });

        //this.animalArray.push(newAnimal);
        this.animalArray.push(newAnimal);
        this.animalTable.renderRows();

        //Set the new row to be selected
        this.selection.select(this.animalDataSource.data.find(row =>
           row.get("position").value == position
           ));

        this.hideIrrelevantChips(animalTypeChip);
    }

  }

  cycleChips(key)
  {
      if(key.match(/^[A-Za-z]+$/))
      {
        let currentAnimal = this.getCurrentAnimal().animalType || "";

        let chips = this.animalTypeChips.chips;

        let lastInstance = "";
        let currentIndex;

        //Get the last value of the current key (e.g. last animal beginning with p)
        //Also get the index of the current item
        chips.forEach((item, index) => {
          if(item.value.substr(0,1).toLowerCase() == currentAnimal.substr(0,1).toLowerCase())
          {
            lastInstance =  item.value;
          }

          if(item.value == currentAnimal)
          {
            currentIndex = index;
          }

        })

        //Filter out any previous records so we can go directly to the next one in the list
        let currentArray = chips.filter((chip, index) => {

          return !(chip.value.substr(0,1).toLowerCase() == currentAnimal.substr(0,1).toLowerCase()
          && index <= currentIndex)
          || currentAnimal == ""
          || lastInstance == currentAnimal

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

    if(this.currentAnimalChip == "" && !(this.animalTypeChips.selected instanceof MatChip))
    {
      alert("Please select an animal");
      problemChip.selected = false;
      return;
    }
    else{

      this.updateAnimalProblemArray(problemChip);

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

          this.updateAnimalProblemArray(chip);

        }
      })
    );

  }

  getCurrentAnimal()
  {
    return this.selection.selected[0];
  }

  deleteAnimalRow(row)
  {
    this.animalArray.removeAt(row.position - 1);

    this.clearChips();

    this.animalTable.renderRows();

    this.selection.clear();

  }

  updateAnimalProblemArray(problemChip)
  {
    //Get the current list of problems and replace the existing problem array

    let problemsObject:Problem = this.problems.find(item =>
      item.problem == problemChip.value
      );

    let problemsGroup = this.fb.group({
      id: [problemsObject.id, Validators.required],
      problem: [problemsObject.problem, Validators.required],
      problemStripped: [problemsObject.problemStripped, Validators.required]
    });

    let currentAnimal:FormGroup = this.getCurrentAnimal();

    //If the problem chip has been selected we need to add it to the problem array of the animal
    //else we need to find this problem in the array and remove it.

    let problems:FormArray = currentAnimal.get('problems') as FormArray;

    let problemIndex = problems.value.findIndex(problem =>
        problem.id == problemsObject.id)


    problemChip.selected ?
      problems.push(problemsGroup)
      :
      problemIndex == -1 ? null : problems.removeAt(problemIndex);

    currentAnimal.get("problemsString").setValue(problems.controls.map(problem =>
        problem.get("problem").value).join(","));

    this.animalTable.renderRows();
  }

  updateTag(currentAnimal)
  {
    console.log(this.recordForm)
    this.selection.isSelected(currentAnimal) ? null : this.toggleRow(currentAnimal);

    this.openDialog(currentAnimal);
  }

  getAnimalFromObservable(name: string)
  {
    return this.animalTypes$.find(animalType => animalType.AnimalType == name);
  }

}
