import { Component, ViewChild, OnInit, Input } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatChip, MatChipList } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { TagNumberDialog } from '../tag-number-dialog/tag-number-dialog.component';
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormArray,
    AbstractControl,
} from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { AnimalType } from 'src/app/core/models/animal-type';
import { UniqueTagNumberValidator } from 'src/app/core/validators/tag-number.validator';
import { Patient, Patients } from 'src/app/core/models/patients';
import { PatientService } from '../../services/patient.service';
import { ProblemDropdownResponse } from 'src/app/core/models/responses';

@Component({
    selector: 'animal-selection',
    templateUrl: './animal-selection.component.html',
    styleUrls: ['./animal-selection.component.scss'],
})
export class AnimalSelectionComponent implements OnInit {
    // I used animalTypes$ instead of animalType here to make the ngFors more readable (let specie(?) of animalType )
    animalTypes$: AnimalType[];
    problems$: ProblemDropdownResponse[];
    exclusions;

    @ViewChild(MatTable, { static: true }) patientTable: MatTable<any>;
    @ViewChild('animalTypeChips', { static: true })
    animalTypeChips: MatChipList;
    @ViewChild('problemChips', { static: true }) problemChips: MatChipList;
    @Input() recordForm: FormGroup;

    patientArrayDisplayedColumns: string[] = [
        'select',
        'animalType',
        'mainProblem',
        'tagNo',
        'delete',
    ];

    patientArray: FormArray;
    currentPatientChip = '';

    selection;
    tagNumber: string;
    validRow: boolean;

    emergencyCaseId: number;

    patientDataSource: MatTableDataSource<AbstractControl>;

    constructor(
        public dialog: MatDialog,
        private fb: FormBuilder,
        private patientService: PatientService,
        private tagNumberValidator: UniqueTagNumberValidator,
        private dropdown: DropdownService,
    ) {}

    ngOnInit() {
        this.recordForm.addControl('patients', this.fb.array([]));

        this.emergencyCaseId = this.recordForm.get(
            'emergencyDetails.emergencyCaseId',
        ).value;

        // if we have a case id we're doing a reload. Otherwise this is a new case.
        this.emergencyCaseId
            ? this.loadPatientArray(this.emergencyCaseId)
            : this.initPatientArray();

        this.dropdown
            .getAnimalTypes()
            .subscribe(animalTypes => (this.animalTypes$ = animalTypes));

        this.dropdown
            .getProblems()
            .subscribe(problems => (this.problems$ = problems));

        this.exclusions = this.dropdown.getExclusions();

        this.subscribeToChanges();
    }

    subscribeToChanges() {
        this.recordForm.get('patients').valueChanges.subscribe(items => {
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

    getPatient(
        problems: FormArray,
        position: number,
        isUpdate: boolean,
        patientId,
    ) {
        const newPatient = this.fb.group({
            patientId: [null],
            position: [position],
            animalTypeId: [''],
            animalType: [''],
            problems,
            problemsString: ['', Validators.required],
            tagNumber: [
                '',
                ,
                this.tagNumberValidator.validate(
                    this.emergencyCaseId,
                    patientId,
                ),
            ],
            duplicateTag: [false, Validators.required],
            updated: [isUpdate, Validators.required],
            deleted: [false, Validators.required],
        });

        return newPatient;
    }

    loadPatientArray(emergencyCaseId: number) {
        this.patientService
            .getPatientsByEmergencyCaseId(emergencyCaseId)
            .subscribe(
                (patients: Patients) => {
                    this.patientArray = this.recordForm.get(
                        'patients',
                    ) as FormArray;

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
        const patients = (this.recordForm.get('patients') as FormArray)
            .controls;

        this.patientDataSource = new MatTableDataSource(patients);

        this.selection = new SelectionModel<Patient>(false, []);
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.patientDataSource.data.length;
        return numSelected === numRows;
    }

    toggleRow(row) {
        this.selection.toggle(row);

        this.clearChips();

        this.reloadChips();
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected()
            ? this.selection.clear()
            : this.patientDataSource.data.forEach(row =>
                  this.selection.select(row),
              );
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: Patient): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${
            this.selection.isSelected(row) ? 'deselect' : 'select'
        } row ${row.position + 1}`;
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

        const currentAnimal = currentPatient.get('animalType').value;

        this.animalTypeChips.chips.forEach(chip => {
            currentAnimal == chip.value
                ? (chip.toggleSelected(),
                  this.hideIrrelevantChips(chip),
                  (this.currentPatientChip = chip.value))
                : chip.deselect;
        });

        const problems = currentPatient.get('problems') as FormArray;

        problems.controls.forEach(problem => {
            this.problemChips.chips.forEach(chip => {
                problem.get('problem').value == chip.value
                    ? chip.toggleSelected()
                    : chip.deselect;
            });
        });
    }

    animalChipSelected(animalTypeChip) {
        animalTypeChip.toggleSelected();

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
            selectedCount == 1 &&
            (animalTypeChip.selected ||
                !(this.animalTypeChips.selected instanceof MatChip))
        ) {
            // There is only 1 row selected, so we can update the animal for that row
            let animalTypeObject;

            animalTypeObject = this.getAnimalFromObservable(
                animalTypeChip.value,
            );

            const currentPatient = this.getcurrentPatient();

            currentPatient
                .get('animalType')
                .setValue(
                    animalTypeChip.selected
                        ? animalTypeObject.AnimalType
                        : null,
                );

            currentPatient
                .get('animalTypeId')
                .setValue(
                    animalTypeChip.selected
                        ? animalTypeObject.AnimalTypeId
                        : null,
                );

            this.hideIrrelevantChips(animalTypeChip);
        }

        // if there are no rows, then we need to add a new one
        if (selectedCount == 0 && animalTypeChip.selected) {
            const currentPatient = this.getAnimalFromObservable(
                animalTypeChip.value,
            );

            const position: number = this.patientDataSource.data.length + 1;

            const newPatient = this.getEmptyPatient();

            newPatient.get('position').setValue(position);
            newPatient
                .get('animalTypeId')
                .setValue(currentPatient.AnimalTypeId);
            newPatient.get('animalType').setValue(currentPatient.AnimalType);

            this.patientArray.push(newPatient);

            this.setSelected(position);
        }
        this.hideIrrelevantChips(animalTypeChip);
        this.patientTable.renderRows();
    }

    setSelected(position: number) {
        // Set the new row to be selected
        this.selection.select(
            this.patientDataSource.data.find(
                row => row.get('position').value == position,
            ),
        );
    }

    focusProblemChip(event, problemChip) {
        if (event.keyCode >= 65 && event.keyCode <= 90) {
            const chips = this.problemChips.chips;

            const foundChip = chips
                .filter(chips => {
                    return chips.disabled == false;
                })
                .find(chip => {
                    return (
                        chip.value.substr(0, 1).toLowerCase() ==
                        event.key.toLowerCase()
                    );
                });

            if (foundChip) {
                foundChip.focus();
            }
        } else if (event.keyCode == 13) {
            this.problemChipSelected(problemChip);
        }
    }

    cycleChips(event, chipGroup: string, property: string) {
        if (event.keyCode >= 65 && event.keyCode <= 90) {
            const currentPatient =
                this.getcurrentPatient().get(property).value || '';

            let chips;

            if (chipGroup == 'animaltype') {
                chips = this.animalTypeChips.chips;
            } else if (chipGroup == 'problem') {
                chips = this.problemChips.chips;
            }

            let lastInstance = '';
            let currentIndex;

            // Get the last value of the current key (e.g. last animal beginning with p)
            // Also get the index of the current item
            chips.forEach((item, index) => {
                if (
                    item.value.substr(0, 1).toLowerCase() ==
                    currentPatient.substr(0, 1).toLowerCase()
                ) {
                    lastInstance = item.value;
                }

                if (item.value == currentPatient) {
                    currentIndex = index;
                }
            });

            // Filter out any previous records so we can go directly to the next one in the list
            const currentArray = chips.filter((chip, index) => {
                return (
                    !(
                        chip.value.substr(0, 1).toLowerCase() ==
                            currentPatient.substr(0, 1).toLowerCase() &&
                        index <= currentIndex
                    ) ||
                    currentPatient == '' ||
                    lastInstance == currentPatient
                );
            });

            // Get the chip we need
            const currentKeyChip = currentArray.find(chip => {
                return (
                    chip.value.substr(0, 1).toLowerCase() ==
                    event.key.toLowerCase()
                );
            });

            this.animalChipSelected(currentKeyChip);
        }
    }

    problemChipSelected(problemChip) {
        problemChip.toggleSelected();

        if (!problemChip.selectable && problemChip.selected) {
            problemChip.selected = false;
            return;
        }

        if (
            !this.currentPatientChip &&
            !(this.animalTypeChips.selected instanceof MatChip)
        ) {
            alert('Please select an animal');
            problemChip.selected = false;
            return;
        } else {
            this.updatePatientProblemArray(problemChip);
        }
    }

    hideIrrelevantChips(animalTypeChip) {
        const currentExclusions = this.exclusions.filter(
            animalType => animalType.animalType == animalTypeChip.value,
        );

        this.problemChips.chips.forEach(chip => {
            chip.disabled = false;
            chip.selectable = true;
        });

        if (!animalTypeChip.selected) {
            return;
        }

        currentExclusions[0].exclusionList.forEach(exclusion =>
            this.problemChips.chips.forEach(chip => {
                if (chip.value === exclusion) {
                    chip.disabled = true;
                    chip.selectable = false;
                    chip.selected = false;
                }
            }),
        );
    }

    getcurrentPatient() {
        return this.selection.selected[0];
    }

    deletePatientRow(row) {
        const position = row.get('position').value;

        const deleted = row.get('deleted').value;

        const patients = this.recordForm.get('patients') as FormArray;

        const removeIndex = patients.controls.findIndex(
            patient => patient.get('position').value === position,
        );

        // if there's no patient id and we click delete, let's get rid of the patient.
        if (!row.get('patientId').value) {
            patients.removeAt(removeIndex);
        } else {
            const currentPatient = patients.controls.find(
                patient => patient.get('position').value == position,
            );

            currentPatient.get('deleted').setValue(!deleted);
            currentPatient.get('updated').setValue(true);
        }
        this.clearChips();

        this.patientTable.renderRows();

        this.selection.clear();
    }

    updatePatientProblemArray(problemChip) {
        const currentPatient = this.getcurrentPatient() as FormGroup;

        // Get the current list of problems and replace the existing problem array
        const problemsObject: ProblemDropdownResponse = this.problems$.find(
            item => item.Problem == problemChip.value,
        );

        const problemsGroup = this.fb.group({
            problemId: [problemsObject.ProblemId, Validators.required],
            problem: [problemsObject.Problem, Validators.required],
        });

        // If the problem chip has been selected we need to add it to the problem array of the animal
        // else we need to find this problem in the array and remove it.
        const problems = currentPatient.get('problems') as FormArray;

        const problemIndex = problems.controls.findIndex(
            problem =>
                problem.get('problemId').value == problemsObject.ProblemId,
        );

        if (problemChip.selected && problemIndex == -1) {
            problems.push(problemsGroup);
            currentPatient.get('updated').setValue(true);
        }

        if (!problemChip.selected) {
            problems.removeAt(problemIndex);
        }

        const problemString = problems.controls
            .map(problem => problem.get('problem').value)
            .join(',');

        currentPatient.get('problemsString').setValue(problemString);

        this.patientTable.renderRows();
    }

    updateTag(currentPatient) {
        this.selection.isSelected(currentPatient)
            ? null
            : this.toggleRow(currentPatient);

        this.openDialog(currentPatient.value);
    }

    openDialog(event): void {
        const currentPatient: Patient = event;

        const dialogRef = this.dialog.open(TagNumberDialog, {
            width: '250px',
            data: {
                tagNumber: currentPatient.tagNumber,
                emergencyCaseId: this.emergencyCaseId,
                patientId: currentPatient.patientId,
                duplicateTag: currentPatient.duplicateTag,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const currentPatient = this.getcurrentPatient();
                currentPatient.get('tagNumber').setValue(result.value);
                currentPatient
                    .get('duplicateTag')
                    .setValue(!(result.status == 'VALID'));
                currentPatient.get('updated').setValue(true);
                this.patientTable.renderRows();
            }
        });
    }

    getAnimalFromObservable(name: string) {
        return this.animalTypes$.find(
            animalType => animalType.AnimalType == name,
        );
    }
}
