import { Component, OnInit } from '@angular/core';
import { PatientCountInArea } from 'src/app/core/models/census-details';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CensusService } from 'src/app/core/services/census/census.service';
import { SurgeryService } from 'src/app/core/services/surgery/surgery.service';
import { SurgeryRecord } from 'src/app/core/models/surgery-details';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { MatDialog } from '@angular/material/dialog';
import { SurgeriesByDateDialogComponent } from '../../components/surgeries-by-date-dialog/surgeries-by-date-dialog.component';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { ReportingService } from '../../services/reporting.service';
import { EmergencyCaseDialogComponent } from '../../components/emergency-case-dialog/emergency-case-dialog.component';
import { EmergencyRecordTable } from 'src/app/core/models/emergency-record';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { take } from 'rxjs/operators';


@Component({
    selector: 'app-reporting-page',
    templateUrl: './reporting-page.component.html',
    styleUrls: ['./reporting-page.component.scss'],
})
export class ReportingPageComponent implements OnInit {

    currentAreaName = '';

    constructor(
        private fb: FormBuilder,
        private census: CensusService,
        private dialog: MatDialog,
        private printService: PrintTemplateService,
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

        this.printService.initialisePrintTemplates();
        this.initialiseReporting();

    }

    initialiseReporting() {

        this.reportingDetails = this.fb.group({
            surgeryDate: [, Validators.required],
            emergencyCaseDate: [],
            streetTreat: [],
            admission: []
        });

        this.census.getCensusPatientCount().then(response => {

            if(response){
                response.sort((a,b) => a.area < b.area ? -1 : 1);
            }

            this.patientCountData = response;
        });

        this.reportingDetails.valueChanges.subscribe((val)=> {

            this.surgeries = this.surgeryService.getSurgeryBySurgeryDate(val.surgeryDate);
            this.surgeries.subscribe(surgeries => this.surgeryCount.next(surgeries.length || 0));

            if(val.emergencyCaseDate) {
                this.emergencyCases =  this.reportingService.getEmergencyCaseByDateAndOutcomeOrST(val.emergencyCaseDate, val.streetTreat, val.admission);
                this.emergencyCases.subscribe(cases=> {
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
                minWidth: '50%',
                data: {
                    surgeries: surgeryList
                }
            });

        });

    }

    openEmergencyCaseDialog() {
        this.emergencyCases.pipe(take(1)).subscribe((caseList: EmergencyRecordTable[] | null)=> {
            this.dialog.open(EmergencyCaseDialogComponent, {
                width: '90%',
                maxHeight: 'auto',
                data: {
                    emergencyCases: caseList
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







}
