import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SurgeryService } from 'src/app/core/services/surgery/surgery.service';
import { SurgeryRecord } from 'src/app/core/models/surgery-details';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { MatDialog } from '@angular/material/dialog';
import { SurgeriesByDateDialogComponent } from '../../components/surgeries-by-date-dialog/surgeries-by-date-dialog.component';
import { ReportingService } from '../../services/reporting.service';
import { EmergencyCaseDialogComponent } from '../../components/emergency-case-dialog/emergency-case-dialog.component';
import { EmergencyRecordTable } from 'src/app/core/models/emergency-record';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { take, takeUntil } from 'rxjs/operators';
import { PatientCountInArea } from 'src/app/core/models/treatment-lists';
import { TreatmentListService } from 'src/app/modules/treatment-list/services/treatment-list.service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-reporting-page',
    templateUrl: './reporting-page.component.html',
    styleUrls: ['./reporting-page.component.scss'],
})
export class ReportingPageComponent implements OnInit {

    currentAreaName = '';
    private ngUnsubscribe = new Subject();

    constructor(
        private fb: FormBuilder,
        private treatmentList: TreatmentListService,
        private dialog: MatDialog,
        private router: Router,
        private surgeryService: SurgeryService,
        private reportingService : ReportingService) {}

    errorMatcher = new CrossFieldErrorMatcher();
    patientCountData : PatientCountInArea[] | null = null;
    surgeries!: Observable<SurgeryRecord[]>;
    surgeryCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    reportingDetails!: FormGroup;
    emergencyCases!: Observable<EmergencyRecordTable[] | null>;
    emergencyCaseCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    totalPatientCount = 0;
    isAdmissionChecked : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isStreetTreatChecked : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    ngOnInit() {
        this.initialiseReporting();
    }

    initialiseReporting() {

        this.reportingDetails = this.fb.group({
            surgeryDate: [, Validators.required],
            emergencyCaseDate: [],
            streetTreat: [],
            admission: []
        });

        this.treatmentList.getTreatmentListPatientCount().then(response => {

            if(response){
                response.sort((a,b) => a.sortArea - b.sortArea);
            }

            this.patientCountData = response;
        });

        this.reportingDetails.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val)=> {



            this.surgeries = this.surgeryService.getSurgeryBySurgeryDate(val.surgeryDate);
            this.surgeries.pipe(takeUntil(this.ngUnsubscribe)).subscribe(surgeries => this.surgeryCount.next(surgeries.length || 0));

            if(val.emergencyCaseDate) {
                this.emergencyCases =  this.reportingService.getEmergencyCaseByDateAndOutcomeOrST(val.emergencyCaseDate, val.streetTreat, val.admission);
                this.emergencyCases.pipe(takeUntil(this.ngUnsubscribe)).subscribe(cases=> {
                    if(cases) {


                        const caseArray = new Set(cases.map(currentCase => currentCase.emergencyNumber));

                        this.emergencyCaseCount.next(caseArray.size || 0);
                    }
                });
            }
        });


        this.reportingDetails.get('surgeryDate')?.setValue(getCurrentDateString());

        this.reportingDetails.get('emergencyCaseDate')?.setValue(getCurrentDateString());
    }

    openSurgeryDetailsDialog(){

        this.surgeries.pipe(take(1)).subscribe(surgeryList => {

           this.dialog.open(SurgeriesByDateDialogComponent, {
                minWidth: '90%',
                data: {
                    surgeries: surgeryList
                }
            });

        });

    }

    openEmergencyCaseDialog() {
        this.emergencyCases.pipe(take(1)).subscribe((caseList: EmergencyRecordTable[] | null)=> {

            this.dialog.open(EmergencyCaseDialogComponent, {
                minWidth: '90%',
                maxHeight: 'auto',
                data: {
                    emergencyCases: caseList || []
                }
            });
        });
    }


    streetTreatChecked(streetTreatBoolean : MatSlideToggleChange) {
        if(streetTreatBoolean.checked) {
           this.isAdmissionChecked.next(false);
           this.reportingDetails.get('admission')?.setValue(false);
        }
        else{
            this.isStreetTreatChecked.next(false);
            this.reportingDetails.get('streetTreat')?.setValue(false);
        }

    }

    admissionChecked(admissionBoolean : MatSlideToggleChange) {
        if(admissionBoolean.checked) {
           this.isStreetTreatChecked.next(false);
           this.reportingDetails.get('streetTreat')?.setValue(false);
        }
        else{
            this.isAdmissionChecked.next(false);
            this.reportingDetails.get('admission')?.setValue(false);
        }

    }

    openTreatmentList(areaName: string){

        this.router.navigate(['/nav/treatment-list', {areaName}], { replaceUrl: true });
        this.dialog.closeAll();

      }





}
