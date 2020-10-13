import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { SurgerySite, SurgeryType, SurgeryById, SurgeryRecord } from 'src/app/core/models/surgery-details';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { Observable } from 'rxjs';
import { SurgeryService } from 'src/app/core/services/surgery/surgery.service';
import { AnimalType } from 'src/app/core/models/animal-type';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { User } from 'src/app/core/models/user';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';

interface Antibiotic {
    id: number;
    Antibiotics: string;
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'surgery-record',
    templateUrl: './surgery-record.component.html',
    styleUrls: ['./surgery-record.component.scss'],
})
export class SurgeryRecordComponent implements OnInit {

    @Input() surgeryId!: number;
    @Input() patientId!: number;
    @Input() tagNumber!: string;
    @Input() emergencyNumber!: number;
    @Input() animalType!: string;
    @Output() public result = new EventEmitter<SurgeryRecord>();
    @Output() public surgeryFormInvalid = new EventEmitter<any>();
    errorMatcher = new CrossFieldErrorMatcher();

    surgeons!: User[];
    surgerySites!: SurgerySite[];
    surgeryTypes!: SurgeryType[];
    surgeriesById!: Observable<SurgeryById[]>;
    animalTypes$!: Observable<AnimalType[]>;
    surgeryDateTime: string | Date = new Date();
    diedDateTime: string | Date = new Date();
    callDateTime: string | Date = new Date();

    surgeryForm = this.fb.group({
        SurgeryId: [],
        PatientId: [],
        TagNumber: [{value: '', disabled:true}],
        EmergencyNumber: [{value: '', disabled:true}],
        AnimalTypeId: [{value: '', disabled:true}],
        SurgeryDate: ['', Validators.required],
        SurgeonId: [, Validators.required],
        SurgerySiteId: [, Validators.required],
        AnesthesiaMinutes: [],
        SurgeryTypeId: [, Validators.required],
        DiedDate: [''],
        DiedComment: [''],
        AntibioticsGiven: [],
        Comment: [''],
    });

    drugs: Antibiotic[] = [
        { id: 1, Antibiotics: 'Yes' },
        { id: 2, Antibiotics: 'NO' },
    ];

    constructor(
        private fb: FormBuilder,
        private dropdown: DropdownService,
        private surgeryService: SurgeryService,
        private showSnackBar : SnackbarService
    ) {



    }


    ngOnInit() {

        this.dropdown.getSurgeon().subscribe(surgeon => { this.surgeons = surgeon; });
        this.dropdown.getSurgerySite().subscribe(site => { this.surgerySites = site; });
        this.dropdown.getSurgeryType().subscribe(type => { this.surgeryTypes = type; });

        this.animalTypes$ = this.dropdown.getAnimalTypes();

        if(this.surgeryId){
            this.surgeryService.getSurgeryBySurgeryId(this.surgeryId).then(response => {
                    this.surgeryForm.patchValue(response[0]);
                });
        }

        this.surgeryForm.patchValue({
            PatientId: this.patientId,
            SurgeryId: this.surgeryId,
            TagNumber: this.tagNumber,
            EmergencyNumber: this.emergencyNumber,
            AnimalTypeId: this.animalType,
        });

        this.surgeryForm.valueChanges.subscribe(() => {
            this.surgeryFormInvalid.emit(this.surgeryForm.invalid);

        });

    }

    // TODO: Abstract this out into the utils class.
    setInitialTime(event: FocusEvent) {
        let currentTime;
        currentTime = this.surgeryForm.get((event.target as HTMLInputElement).name)?.value;

        if (!currentTime) {

            const target = this.surgeryForm.get((event.target as HTMLInputElement).name);

            if(target){
                target.setValue(getCurrentTimeString());
            }

        }
    }

    async saveSurgery() {
        if (!this.surgeryForm.touched) {
            this.result.emit(undefined);
            return;
        }

        await this.surgeryService
              .saveSurgery(this.surgeryForm.value).then((value: any) => {

                if (value) {

<<<<<<< HEAD
                    const surgeonNameForTable = this.surgeons.find(user => user.UserId === this.surgeryForm.get('SurgeonId')?.value );
                    const surgeryTypeForTable = this.surgeryTypes.find(surgeryType => surgeryType.SurgeryTypeId === this.surgeryForm.get('SurgeryTypeId')?.value );
                    const surgerySiteForTable = this.surgerySites.find(surgerySite => surgerySite.SurgerySiteId === this.surgeryForm.get('SurgerySiteId')?.value );

                    if (surgeonNameForTable === undefined) {
                        throw new TypeError('Missing surgeon name!');
                    }

                    if (surgeryTypeForTable === undefined) {
                        throw new TypeError('Missing surgery type!');
                    }

                    if (surgerySiteForTable === undefined) {
                        throw new TypeError('Missing surgery site!');
                    }
=======
                    const surgeonNameForTable = this.surgeons.find(user => user.UserId === this.surgeryForm.get('SurgeonId').value );
                    const surgeryTypeForTable = this.surgeryTypes.find
                    (surgeryType => surgeryType.SurgeryTypeId === this.surgeryForm.get('SurgeryTypeId').value );
                    const surgerySiteForTable = this.surgerySites.find
                    (surgerySite => surgerySite.SurgerySiteId === this.surgeryForm.get('SurgerySiteId').value );
>>>>>>> develop

                    const surgeryTableData: SurgeryRecord = {
                        surgeryId: value.surgeryId,
                        date: this.surgeryForm.get('SurgeryDate')?.value,
                        died: this.surgeryForm.get('DiedDate')?.value,
                        site: surgerySiteForTable.SurgerySite,
                        surgeon: surgeonNameForTable.FirstName,
                        type: surgeryTypeForTable.SurgeryType,
                        anesthesiaMinutes: this.surgeryForm.get('AnesthesiaMinutes')?.value,
                        antibioticsGiven: this.surgeryForm.get('AntibioticsGiven')?.value,
                        comments: this.surgeryForm.get('Comment')?.value,
                    };

                    this.showSnackBar.successSnackBar('Surgery saved!' , 'Ok');

                    this.result.emit(surgeryTableData);
                } else {
                    this.showSnackBar.errorSnackBar('Error!', 'Dismiss');
                }
            });
    }

    async resetForm() {
        this.surgeryForm.reset();
    }

}
