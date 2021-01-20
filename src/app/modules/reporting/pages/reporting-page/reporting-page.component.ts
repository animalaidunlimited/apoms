import { Component, OnInit } from '@angular/core';
import { CensusArea } from 'src/app/core/models/census-details';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CensusService } from 'src/app/core/services/census/census.service';
import { SurgeryService } from 'src/app/core/services/surgery/surgery.service';
import { SurgeryRecord } from 'src/app/core/models/surgery-details';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { MatDialog } from '@angular/material/dialog';
import { SurgeriesByDateDialogComponent } from '../../components/surgeries-by-date-dialog/surgeries-by-date-dialog.component';
import { PatientDetailsDialogComponent } from '../../components/patient-details-dialog/patient-details-dialog.component';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { ReportingService } from '../../services/reporting.service';
import { EmergencyCaseDialogComponent } from '../../components/emergency-case-dialog/emergency-case-dialog.component';
import { EmergencyRecordTable } from 'src/app/core/models/emergency-record';
import { promise } from 'protractor';


interface PatientCountInArea{
    area : string;
    count : number;
}



@Component({
    selector: 'app-reporting-page',
    templateUrl: './reporting-page.component.html',
    styleUrls: ['./reporting-page.component.scss'],
})
export class ReportingPageComponent implements OnInit {

    constructor(
        private fb: FormBuilder,
        private census: CensusService,
        private dialog: MatDialog,
        private printService: PrintTemplateService,
        private surgeryService: SurgeryService,
        private reportingService : ReportingService) {}

    censusAreas$! : Observable<CensusArea[]>;
    censusArea! : FormGroup;
    errorMatcher = new CrossFieldErrorMatcher();
    patientCountData : PatientCountInArea[] = [{area : '',count : 0}];
    surgeries!: Observable<SurgeryRecord[]>;
    surgeryCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    reportingDetails!: FormGroup;
    emergencyCases!: Promise<EmergencyRecordTable[] | null>;
    emergencyCaseCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    totalPatientCount = 0;

    ngOnInit() {

        this.printService.initialisePrintTemplates();

        this.census.getCensusPatientCount().then(response => {
            this.patientCountData = response;
        });

        this.reportingDetails = this.fb.group({
            surgeryDate: [, Validators.required],
            emergencyCaseDate: []
        });

        this.reportingDetails.get('surgeryDate')?.valueChanges.subscribe(() => {

            this.surgeries = this.surgeryService.getSurgeryBySurgeryDate(this.reportingDetails.get('surgeryDate')?.value);
            this.surgeries.subscribe(surgeries => this.surgeryCount.next(surgeries.length || 0));
        });

        this.reportingDetails.get('emergencyCaseDate')?.valueChanges.subscribe(() => {
            this.emergencyCases =  this.reportingService.getEmergencyCaseByDate(this.reportingDetails.get('emergencyCaseDate')?.value);

            this.emergencyCases.then((cases: any)=> this.emergencyCaseCount.next(cases.length || 0));
        });

        this.reportingDetails.get('surgeryDate')?.setValue(getCurrentDateString());

        this.reportingDetails.get('emergencyCaseDate')?.setValue(getCurrentDateString());

    }

    getPatientDetailsByArea(area:string){

        this.dialog.open(PatientDetailsDialogComponent, {

          width: '90%',
          maxHeight: 'auto',
          data: {
            areaName : area
          },
      });

    }

    openSurgeryDetailsDialog(){

        this.surgeries.subscribe(surgeryList => {

           this.dialog.open(SurgeriesByDateDialogComponent, {
                minWidth: '50%',
                data: {
                    surgeries: surgeryList
                }
            });

        });

    }

    openEmergencyCaseDialog() {
        this.emergencyCases.then((caseList: EmergencyRecordTable[] | null)=> {
            this.dialog.open(EmergencyCaseDialogComponent, {
                width: '90%',
                maxHeight: 'auto',
                data: {
                    emergencyCases: caseList
                }
            });
        });
    }





}
