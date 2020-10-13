import { Component, OnInit, Input } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SearchRecordTab } from 'src/app/core/models/search-record-tab';
<<<<<<< HEAD
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
=======
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { MediaItem } from 'src/app/core/models/media';
>>>>>>> develop

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'patient-record',
    templateUrl: './patient-record.component.html',
    styleUrls: ['./patient-record.component.scss'],
})
export class PatientRecordComponent implements OnInit {

    recordForm: FormGroup;

    @Input() incomingPatient!: SearchRecordTab;

    patientCallPatientId = -1;

    patientLoaded = true;

    hideMenu = false;

<<<<<<< HEAD
    constructor(
        private fb: FormBuilder,
        private patientService: PatientService,
        private snackbar: SnackbarService
        ) {

            this.recordForm = this.fb.group({
                emergencyDetails: this.fb.group({
                    emergencyCaseId: [this.incomingPatient.emergencyCaseId],
                    emergencyNumber: [this.incomingPatient.emergencyNumber],
                    callDateTime: [this.incomingPatient.callDateTime],
                }),

                patientDetails: this.fb.group({
                    patientId: [this.incomingPatient.patientId],
                    tagNumber: [
                        this.incomingPatient.tagNumber,
                        Validators.required,
                    ],
                    currentLocation: [this.incomingPatient.currentLocation],
                    animalType: [this.incomingPatient.animalType],
                }),
                patientStatus: this.fb.group({
                    status: [''],
                    releaseDate: [''],
                    diedDate: [''],
                    escapeDate: [''],
                    PN: [''],
                    suspectedRabies: [''],
                }),
                callerDetails: this.fb.group({
                    callerId: [''],
                    callerName: [''],
                    callerNumber: [''],
                    callerAlternativeNumber: [''],
                }),
                callOutcome: this.fb.group({
                    CallOutcome: ['{\'CallOutcomeId\': ' + this.incomingPatient.callOutcomeId + ', \'CallOutcome\': ' + this.incomingPatient.callOutcome + '}'],
                    sameAsNumber: []
                }),
            });

        }
=======
    profileUrl: SafeUrl;

    mediaData: Observable<MediaItem[]>;

    constructor(private fb: FormBuilder,
        private patientService: PatientService) {}
>>>>>>> develop

    ngOnInit() {
        this.hideMenu = window.innerWidth > 840 ? false : true;

<<<<<<< HEAD

=======
        this.recordForm = this.fb.group({
            emergencyDetails: this.fb.group({
                emergencyCaseId: [this.incomingPatient.emergencyCaseId],
                emergencyNumber: [this.incomingPatient.emergencyNumber],
                callDateTime: [this.incomingPatient.callDateTime],
            }),

            patientDetails: this.fb.group({
                patientId: [this.incomingPatient.patientId],
                tagNumber: [
                    this.incomingPatient.tagNumber,
                    Validators.required,
                ],
                currentLocation: [this.incomingPatient.currentLocation],
                animalType: [this.incomingPatient.animalType],
            }),
            patientStatus: this.fb.group({
                status: [''],
                releaseDate: [''],
                diedDate: [''],
                escapeDate: [''],
                PN: [''],
                suspectedRabies: [''],
            }),
            callerDetails: this.fb.group({
                callerId: [''],
                callerName: [''],
                callerNumber: [''],
                callerAlternativeNumber: [''],
            }),
            callOutcome: this.fb.group({
                CallOutcome: ['{\'CallOutcomeId\': ' + this.incomingPatient.callOutcomeId +
                 ', \'CallOutcome\': ' + this.incomingPatient.callOutcome + '}'],
                sameAsNumber: []
            }),
        });
>>>>>>> develop

        // Use this to disable tabs before we've got a patient.
        this.patientLoaded = !(this.incomingPatient?.patientId > 0);

        const patientId  = this.incomingPatient.patientId;

        this.mediaData = this.patientService.getPatientMediaItemsByPatientId(patientId);
        if(this.mediaData){
        this.mediaData.subscribe(media=>{
            const mediaItem = media.find(item=>Boolean(item.isPrimary) === true);
            this.profileUrl = mediaItem.localURL;

        });
    }
    }

    tabChanged(event: MatTabChangeEvent) {
        // Only populate the ids when we want to load the data
        if (event.tab.textLabel === 'Patient Calls') {
            this.patientCallPatientId = this.recordForm.get('patientDetails.patientId')?.value;
        }
    }

    toggleMenu() {
        this.hideMenu = !this.hideMenu;
    }

    saveForm() {

        this.patientService.updatePatientDetails(this.recordForm.get('patientDetails')?.value).then(result => {
            result.success === 1 ?
                this.snackbar.successSnackBar('Update successful','OK')
                :
                this.snackbar.errorSnackBar('Update failed','OK');
        });

    }
}
