import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { CensusAreaName, Area } from 'src/app/core/models/census-details';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { CensusService } from 'src/app/core/services/census/census.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { formatDate } from '@angular/common';

@Component({
  selector: 'census-record',
  templateUrl: './census-record.component.html',
  styleUrls: ['./census-record.component.scss']
})
export class CensusRecordComponent implements OnInit {

  @Input() censusUpdateDate : Date;

  @ViewChild('chipList') chipList;

  addOnBlur = true;

  censusAreaNames$: Observable<CensusAreaName[]>;

  censusDate: FormGroup;

  censusArea: Area[];

  date: Date;

  removable = true;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  selectable = true;

  visible = true;

  constructor(
      private fb: FormBuilder,
      private census: CensusService,
      private snackBar: SnackbarService,
  ) {}

  ngOnInit() {
      this.censusDate = this.fb.group({
          CensusDate: [this.getCurrentDate()],
      });


  if(this.censusUpdateDate){
        this.censusDate.patchValue({CensusDate : this.censusUpdateDate});
        this.loadCensusData(this.censusDate.get('CensusDate').value);
  }
  else{
    this.loadCensusData(this.censusDate.get('CensusDate').value);
  }

      

      this.censusArea = [
          {
              areaId: null,
              areaName: '',
              sortArea: null,
              actions: [
                  {
                      actionId: null,
                      actionName: '',
                      sortAction: null,
                      patients: [
                          {
                              patientId: null,
                              tagNumber: '',
                              errorCode: null,
                          },
                      ],
                  },
              ],
          },
      ];

      /* Detects the change in date and vrings back the censusdata on that perticular date*/
      this.censusDate.valueChanges.subscribe(changes => {
          this.date = changes.CensusDate.toString();

          this.loadCensusData(this.date);
      });
  }

  loadCensusData(censusDate: Date) {
      this.census.getCensusData(censusDate).then(censusData => {
          this.censusArea = this.getSortedResponse(censusData);
      });
  }

  /* Sorts the arrays from censusdata object. */
  getSortedResponse(censusData) {
      const sortedAreaResponse = censusData.sort((a, b) => {
          return a.sortArea - b.sortArea;
      });
      return this.getSortedAction(sortedAreaResponse);
  }

  /*Sorts the area.actions arrays from the censusdata Object and return it back tio the getSortedResponce function*/

  getSortedAction(areas) {
      areas.forEach(area => {
          area.actions.sort((a, b) => {
              return a.sortAction - b.sortAction;
          });
      });

      return areas;
  }

  /* Add the patients tagNumber to the chips input field*/
  addPatients(AreaId, ActionId, event: MatChipInputEvent): void {
      const input = event.input;
      const tag = event.value.trim();
      if (tag || '') {
          this.censusArea.forEach(area => {
              if (area.areaId === AreaId) {
                  area.actions.forEach(action => {
                      if (action.actionId === ActionId) {
                          const exists = action.patients.some(patient => {
                              return (
                                  patient.tagNumber.toLowerCase() ===  tag.toLowerCase()
                              );
                          });

                          exists
                              ? this.snackBar.errorSnackBar(
                                    'Duplicate Error!',
                                    'OK',
                                )
                              : this.census
                                    .insertCensusData(
                                        area.areaId,
                                        area.sortArea,
                                        action.actionId,
                                        action.sortAction,
                                        tag,
                                        this.censusDate.get('CensusDate')
                                            .value,
                                    )
                                    .then(response => {
                                        action.patients.push({
                                            patientId: response[0].vPatientId,
                                            tagNumber: tag.toUpperCase(),
                                            errorCode: response[0].vErrorCode,
                                        });
                                    });
                      }
                  });
              }
          });
      }

      if (input) {
          input.value = '';
      }
  }

  /* Returns the Current Date*/
  getCurrentDate() {
      const date = new Date();
      const wn = window.navigator as any;
      const locale = wn.languages ? wn.languages[0] : 'en-GB';
      return formatDate(date, 'yyyy-MM-dd', locale);
  }

  setInitialTime(event: FocusEvent) {
      let currentTime;
      currentTime = this.censusDate.get(
          (event.target as HTMLInputElement).name,
      ).value;

      if (!currentTime) {
          this.censusDate
              .get((event.target as HTMLInputElement).name)
              .setValue(this.getCurrentDate());
      }
  }

  /* Removes the patient tagNumber from chips input field*/

  removePatients(AreaId, ActionId, patient): void {
      this.censusArea.forEach(area => {
          if (area.areaId === AreaId) {
              area.actions.forEach(action => {
                  if (action.actionId === ActionId) {
                      this.census.deleteCensusData(
                          area.areaId,
                          area.sortArea,
                          action.actionId,
                          action.sortAction,
                          patient.tagNumber,
                          this.date,
                      );
                      const index = action.patients.indexOf(patient);
                      action.patients.splice(index, 1);
                  }
              });
          }
      });
  }




}
