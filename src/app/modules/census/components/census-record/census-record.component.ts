import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Area } from 'src/app/core/models/census-details';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ENTER, COMMA, SPACE } from '@angular/cdk/keycodes';
import { CensusService } from 'src/app/core/services/census/census.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { formatDate } from '@angular/common';
import { CensusRecord } from 'src/app/modules/hospital-manager/components/census-details/census-details.component';
import { ChangeDetectorRef } from '@angular/core';
import { formatDateString, getCurrentDateString } from 'src/app/core/helpers/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'census-record',
  templateUrl: './census-record.component.html',
  styleUrls: ['./census-record.component.scss']
})
export class CensusRecordComponent implements OnInit {

  @Input() censusUpdateDate! : Date;
  @Output() public result = new EventEmitter<CensusRecord>();
  @Output() public remove = new EventEmitter<CensusRecord>();

  @ViewChild('chipList') chipList! : MatChipList;

  private ngUnsubscribe = new Subject();

  loading = false;

  addOnBlur = true;

  censusDate: FormGroup = new FormGroup({});

  censusArea: Area[] = [];

  removable = true;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA , SPACE];

  selectable = true;

  visible = true;

  showCensusErrorLog = false;

  showErrorLogBtn = false;

  hasWritePermission = false;

  // TODO: Create a type for this.
  censusErrorRecords!: any;

  constructor(
      private fb: FormBuilder,
      private census: CensusService,
      private snackBar: SnackbarService,
      private cdref : ChangeDetectorRef,
      private router: Router,
      private route: ActivatedRoute
  ) {}

    ngOnInit() {

        // tslint:disable-next-line: deprecation
        this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val=> {
            if (val.componentPermissionLevel?.value === 2) {
                this.hasWritePermission = true;
            }

        });

        this.censusDate = this.fb.group({
            CensusDate: [formatDateString(this.censusUpdateDate)],
        });
        
        this.loadCensusData(this.censusDate.get('CensusDate')?.value);

        this.censusArea = [
            {
                areaId: undefined,
                areaName: '',
                sortArea: undefined,
                actions: [
                    {
                        actionId: undefined,
                        actionName: '',
                        sortAction: undefined,
                        patients: [
                            {
                                patientId: undefined,
                                tagNumber: '',
                                colour: '',
                                errorCode: undefined,
                            },
                        ],
                    },
                ],
            },
        ];

        /* Detects the change in date and Brings back the censusdata on that perticular date*/
        // tslint:disable-next-line: deprecation
        this.censusDate.valueChanges.subscribe(changes => {

            this.loadCensusData(changes.CensusDate.toString() || new Date());
        });

        this.loadCensusErrorRecords();
    }

    loadCensusErrorRecords() {
        this.census.getCensusErrorRecords().then(errorRecords=> {
            if(errorRecords.length) {
                this.censusErrorRecords = errorRecords;
                this.showErrorLogBtn = true;
            }
            else {
                this.showErrorLogBtn = false;
            }
            
        });
    }

  loadCensusData(censusDate: Date) {

    this.census.getCensusData(censusDate).then(censusData => {
        this.censusArea = this.getSortedResponse(censusData);
    });

  }

  /* Sorts the arrays from censusdata object. */
  getSortedResponse(censusData:any) {
      const sortedAreaResponse = censusData.sort((a:any, b:any) => {
          return a.sortArea - b.sortArea;
      });
      return this.getSortedAction(sortedAreaResponse);
  }

  /*Sorts the area.actions arrays from the censusdata Object and return it back tio the getSortedResponce function*/
  getSortedAction(areas:any) {
      areas.forEach((area:any) => {
          area.actions.sort((a:any, b:any) => {
              return a.sortAction - b.sortAction;
          });
      });

      return areas;
  }

  /* Add the patients tagNumber to the chips input field*/

  addPatients(incomingAreaId:number | undefined, incomingActionId:number | undefined, event: MatChipInputEvent): void {

    if(this.hasWritePermission) {

        if(!incomingAreaId){
            throw new Error ('IncomingAreaId is undefineed');
        }
    
        if(!incomingActionId){
            throw new Error ('IncomingActionId is undefineed');
        }
    
          const input = event.input;
          const tag = event.value.trim();
          if (tag || '') {
              this.censusArea.forEach(area => {
                  if (area.areaId === incomingAreaId) {
                      area.actions.forEach(action => {
                          if (action.actionId === incomingActionId) {
                              const exists = action.patients.some(patient => {
                                  return (
                                      patient.tagNumber.toLowerCase() ===  tag.toLowerCase()
                                  );
                              });
                              this.loading = true;
    
                              exists
                                  ? (this.snackBar.errorSnackBar('Duplicate Error!','OK',), this.loading = false)
                                  : this.census
                                        .insertCensusData(
                                            area.areaId || -1,
                                            area.sortArea || -1,
                                            action.actionId,
                                            action.sortAction || -1,
                                            tag,
                                            this.censusDate.get('CensusDate')?.value
                                        )
                                        .then(response => {
    
                                            if(response){
                                                this.loading = false;
                                                this.loadCensusErrorRecords();
                                                action.patients.push({
                                                    patientId: response[0].vPatientId,
                                                    tagNumber: tag.toUpperCase(),
                                                    colour: '',
                                                    errorCode: response[0].vErrorCode,
                                                });
                                                this.cdref.detectChanges();
                                            }
    
                                             this.censusArea.forEach(censusAreas=>
                                                {
    
                                                    censusAreas.actions.forEach(censusActions=>{
                                                        censusActions.patients.forEach(censusPatients=>{
    
                                                            if(censusPatients.tagNumber === tag.toUpperCase() ||
                                                            censusPatients.patientId === response[0].vPatientId){
                                                                censusPatients.errorCode = response[0].vErrorCode;
                                                                this.cdref.detectChanges();
                                                            }
                                                        });
    
    
                                                    });
                                                });
                                        });
    
                                        const CensusTableData : CensusRecord = {
                                            date : this.censusDate.get('CensusDate')?.value,
                                            area : area.areaName,
                                            action : action.actionName,
                                            days : 0,
                                            order: 0
                                        };
                                        this.result.emit(CensusTableData);
                            }
                        });
                    }
                });
            }
    
    
    
          if (input) {
              input.value = '';
          }

    }
    else {
        this.snackBar.errorSnackBar('You have no appropriate permissions' , 'OK');
    }

    

  }

    

//   setInitialTime(event: FocusEvent) {
//       let currentTime;
//       currentTime = this.censusDate.get((event.target as HTMLInputElement).name)?.value;

//       if (!currentTime) {
//           this.censusDate.get((event.target as HTMLInputElement).name)?.setValue(getCurrentDateString());
//       }
//   }

  /* Removes the patient tagNumber from chips input field*/

  removePatients(incomingAreaId:any, incomingActionId:any, patient:any): void {
      this.censusArea.forEach(area => {
          if (area.areaId === incomingAreaId) {
              area.actions.forEach(action => {
                  if (action.actionId === incomingActionId) {
                      this.loading = true;
                      this.census.deleteCensusData(
                          area.areaId || -1,
                          area.sortArea || -1,
                          action.actionId || -1,
                          action.sortAction || -1,
                          patient.tagNumber,
                          this.censusDate.get('CensusDate')?.value,
                      ).then(response=>{
                          if(response){
                              this.loading = false;

                              this.loadCensusErrorRecords();

                              this.censusArea.forEach(censusAreas=>
                                {

                                    censusAreas.actions.forEach(censusActions=>{
                                        censusActions.patients.forEach(censusPatients=>{

                                            if(censusPatients.tagNumber === response.prm_TagNumber){
                                                censusPatients.errorCode = response.vErrorCode;
                                               this.cdref.detectChanges();
                                            }
                                        });

                                    });
                                });


                            }
                      });
                      const index = action.patients.indexOf(patient);
                      action.patients.splice(index, 1);
                      const CensusTableData : CensusRecord = {
                            date : this.censusDate.get('CensusDate')?.value,
                            area : area.areaName,
                            action : action.actionName,
                            days : 0,
                            order: 0
                        };
                    this.remove.emit(CensusTableData);
                  }
              });
          }
      });
  }

tagNumberClicked(value:string){

    this.openHospitalManagerRecord(value);


}

openHospitalManagerRecord(tagNumber: string){

    this.router.navigate(['/nav/hospital-manager', {tagNumber}], { replaceUrl: true });

}





}

