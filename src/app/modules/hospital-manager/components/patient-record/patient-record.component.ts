import { LogsData } from './../../../../core/models/logs-data';
import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SearchRecordTab } from 'src/app/core/models/search-record-tab';
import { SafeUrl } from '@angular/platform-browser';
import { MediaItem } from 'src/app/core/models/media';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ReleaseDetails } from 'src/app/core/models/release';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'patient-record',
    templateUrl: './patient-record.component.html',
    styleUrls: ['./patient-record.component.scss'],
})
export class PatientRecordComponent implements OnInit, OnDestroy {

    @Input() incomingPatient!: SearchRecordTab;

    hasWritePermission = false;
    hideMenu = false;

    loading = false;
    logsData!:LogsData;
    mediaData!: BehaviorSubject<MediaItem[]>;
    recordForm: FormGroup = new FormGroup({});

    patientId!:number;

    patientLoaded = true;

    profileUrl: SafeUrl = '../../../../../../assets/images/image_placeholder.png';

    permissionType!: number[];

    releaseDetails!: ReleaseDetails;

    private ngUnsubscribe = new Subject();

    constructor(private fb: FormBuilder,
        private snackbar: SnackbarService,
        private changeDetector: ChangeDetectorRef,
        private patientService: PatientService,
        private route : ActivatedRoute) {

        }

    ngOnInit() {

        // tslint:disable-next-line: deprecation
        this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val=> {

            if (val.componentPermissionLevel?.value === 2) {
                this.hasWritePermission = true;
            }
        });

        this.hideMenu = window.innerWidth > 840 ? false : true;

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
            callOutcome: this.fb.group({
                CallOutcome: ['{\'CallOutcomeId\': ' + this.incomingPatient.callOutcomeId +
                 ', \'CallOutcome\': ' + this.incomingPatient.callOutcome + '}'],
                sameAsNumber: []
            }),
        });


        // Use this to disable tabs before we've got a patient.
        this.patientLoaded = !(this.incomingPatient?.patientId > 0);

        this.patientId = this.incomingPatient.patientId;

        this.mediaData = this.patientService.getPatientMediaItemsByPatientId(this.patientId);
        
        if(this.mediaData){

            // tslint:disable-next-line: deprecation
            this.mediaData.subscribe(media=>{
                if(media.length === 0){
                    return;
                }

                
                this.profileUrl = media.find(item=>Boolean(item.isPrimary) === true)?.remoteURL || media[0].remoteURL || '../../../../../../assets/images/image_placeholder.png';
                
                this.changeDetector.detectChanges();

            });
    
        }
        this.logsData = {
            emergencyCaseId: this.recordForm.value.emergencyDetails.emergencyCaseId,
            emergencyNumber: this.recordForm.value.emergencyDetails.emergencyNumber,
            patientId: this.recordForm.value.patientDetails.patientId
        };


    }

    ngOnDestroy(){
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    tabChanged(event: MatTabChangeEvent) {
        // Only populate the ids when we want to load the data
        if (event.tab.textLabel === 'Patient Calls') {
            this.patientId = this.recordForm.get('patientDetails.patientId')?.value;
        }
    }

    toggleMenu() {
        this.hideMenu = !this.hideMenu;
    }

    saveForm() {

        if(this.hasWritePermission) {
            this.loading = true;

            this.patientService.updatePatientDetails(this.recordForm.get('patientDetails')?.value).then(result => {
                this.loading = false;
                result.success === 1 ? this.snackbar.successSnackBar('Update successful','OK') : this.snackbar.errorSnackBar('Update failed','OK');
            });
        }
        else {
            this.snackbar.errorSnackBar('You do not have permission to save; please see the admin' , 'OK');
        }

    }
}
