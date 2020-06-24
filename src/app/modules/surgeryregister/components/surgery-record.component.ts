import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import {Surgeon,SurgerySite,SurgeryType,SurgeryById,UpdatedSurgery,SurgeryFormModel,} from 'src/app/core/models/Surgery-details';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { Observable, iif } from 'rxjs';
import { SurgeryService } from 'src/app/core/services/surgery/surgery.service';
import { AnimalType } from 'src/app/core/models/animal-type';
import { getCurrentTimeString } from 'src/app/core/utils';
import { SurgeryRecord } from '../../hospital-manager/components/surgery-details/surgery-details.component';
import { User } from 'src/app/core/models/user';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { SnackbarService } from "src/app/core/services/snackbar/snackbar.service";
import { MatSnackBar } from "@angular/material/snack-bar";
interface Antibiotic {
    id: number;
    Antibiotics: string;
} 

@Component({
    selector: 'surgery-record',
    templateUrl: './surgery-record.component.html',
    styleUrls: ['./surgery-record.component.scss'],
})
export class SurgeryRecordComponent implements OnInit {

    constructor(
        private fb: FormBuilder,
        private dropdown: DropdownService,
        private surgeryService: SurgeryService,
        private showSnackBar : SnackbarService,
        private snackBar : MatSnackBar
    ) {}
    @Input() surgeryId: number;
    @Input() patientId: number;
    @Input() tagNumber: string;
    @Input() emergencyNumber: number;
    @Input() animalType: string;
    @Output() public result = new EventEmitter<UpdatedSurgery>();
    @Output() public surgeryFormInvalid = new EventEmitter<any>();
    errorMatcher = new CrossFieldErrorMatcher();

    surgeons: User[];
    surgerySites: SurgerySite[];
    surgeryTypes: SurgeryType[];
    surgeriesById: Observable<SurgeryById[]>;
    animalTypes$: Observable<AnimalType[]>;
    surgeryDateTime;
    diedDateTime;
    callDateTime;

    DiedDate: AbstractControl;

    surgeryForm = this.fb.group({
        SurgeryId: [],
        PatientId: [],
        TagNumber: [''],
        EmergencyNumber: [],
        AnimalTypeId: [''],
        SurgeryDate: ['', Validators.required],
        UserId: [, Validators.required],
        SurgerySiteId: [, Validators.required],
        AnesthesiaMinutes: [],
        SurgeryTypeId: [, Validators.required],
        DiedDate: [''],
        DiedComment: [''],
        AntibioticsGiven: [],
        Comment: [''],
    });
    surgeonList;

    drugs: Antibiotic[] = [
        { id: 1, Antibiotics: 'Yes' },
        { id: 2, Antibiotics: 'NO' },
    ];
    ngOnInit() {
        this.dropdown.getSurgeon().subscribe(surgeon => (this.surgeons = surgeon));
        this.dropdown.getSurgerySite().subscribe(site => (this.surgerySites = site));
        this.dropdown.getSurgeryType().subscribe(type => (this.surgeryTypes = type));
        this.animalTypes$ = this.dropdown.getAnimalTypes();
       
        
        if(this.surgeryId){
            this.surgeryService.getSurgeryBySurgeryId(this.surgeryId).then(response =>
                {
                    this.surgeryForm.patchValue(response[0]);
                });
        }
        this.surgeryForm.patchValue({
            PatientId: this.patientId,
            TagNumber: this.tagNumber,
            EmergencyNumber: this.emergencyNumber,
            AnimalTypeId: this.animalType
        });

        this.surgeryForm.valueChanges.subscribe(change => {

            this.surgeryFormInvalid.emit(this.surgeryForm.invalid);
            
        })
    }

    // TODO: Abstract this out into the utils class.
    setInitialTime(event: FocusEvent) {
        let currentTime;
        currentTime = this.surgeryForm.get(
            (event.target as HTMLInputElement).name,
        ).value;

        if (!currentTime) {
            this.surgeryForm.get(
                (event.target as HTMLInputElement).name,
            ).setValue(getCurrentTimeString());
        }
    }

    async saveSurgery() {
        if (!this.surgeryForm.touched) {
            this.result.emit(null);
            return;
        }
        await this.surgeryService
            .insertSurgery(this.surgeryForm.value).then((value: any) => {
                if (value) {
                    let surgeonNameForTable;

                    let surgeryTypeForTable;

                    let surgerySiteForTable;

                    surgeonNameForTable = this.surgeons.find(user =>
                    user.UserId == this.surgeryForm.get('UserId').value);
                    surgeryTypeForTable = this.surgeryTypes.find( surgeryType =>surgeryType.SurgeryTypeId == this.surgeryForm.get('SurgeryTypeId').value);
                    surgerySiteForTable = this.surgerySites.find(surgerySite =>surgerySite.SurgerySiteId == this.surgeryForm.get('SurgerySiteId').value);

                    const surgeryTableData: SurgeryRecord = {
                        surgeryId: this.surgeryForm.get('SurgeryId').value,
                        date: this.surgeryForm.get('SurgeryDate').value,
                        died: this.surgeryForm.get('DiedDate').value,
                        site: surgerySiteForTable.SurgerySite,
                        surgeon: surgeonNameForTable.FirstName,
                        type: surgeryTypeForTable.SurgeryType,
                        anesthesiaMinutes: this.surgeryForm.get('AnesthesiaMinutes').value,
                        antibioticsGiven: this.surgeryForm.get('AntibioticsGiven').value,
                        comments: this.surgeryForm.get('Comment').value,
                    };
                    this.showSnackBar.successSnackBar("Surgery Inserted!" , "Ok");
                    this.result.emit(surgeryTableData);
                }

                else{
                    this.showSnackBar.errorSnackBar("Error!" , "Dismiss")
                }
            });
    }

    async resetForm() {
        this.surgeryForm.reset();
    }

    async updateSurgery() {
        if (!this.surgeryForm.touched) {
            this.result.emit(null);
            return;
        }
        await this.surgeryService
            .insertSurgery(this.surgeryForm.value)
            .then((data: any) => {
                if (data.success == 1) {
                    let surgeonNameForTable;

                    let surgeryTypeForTable;

                    let surgerySiteForTable;

                    surgeonNameForTable = this.surgeons.find(user =>
                    user.UserId == this.surgeryForm.get('UserId').value);
                    surgeryTypeForTable = this.surgeryTypes.find(surgeryType =>surgeryType.SurgeryTypeId == this.surgeryForm.get('SurgeryTypeId').value);
                    surgerySiteForTable = this.surgerySites.find(surgerySite =>surgerySite.SurgerySiteId == this.surgeryForm.get('SurgerySiteId').value);

                    const surgeryTableData: SurgeryRecord = {
                        surgeryId: this.surgeryForm.get('SurgeryId').value,
                        date: this.surgeryForm.get('SurgeryDate').value,
                        died: this.surgeryForm.get('DiedDate').value,
                        site: surgerySiteForTable.SurgerySite,
                        surgeon: surgeonNameForTable.FirstName,
                        type: surgeryTypeForTable.SurgeryType,
                        anesthesiaMinutes: this.surgeryForm.get('AnesthesiaMinutes').value,
                        antibioticsGiven: this.surgeryForm.get('AntibioticsGiven').value,
                        comments: this.surgeryForm.get('Comment').value,
                    };
                    this.showSnackBar.successSnackBar("Surgery Updated!" , "Ok")
                    this.result.emit(surgeryTableData); 
                }
                else{
                    this.showSnackBar.errorSnackBar("Error!" , "Dismiss")
                }
            });
    }
   

}
