import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild, ɵConsole, ChangeDetectorRef } from '@angular/core';
import { Area , Action , CensusPatient , CensusAreaName } from 'src/app/core/models/census-details';
import { MatChipInputEvent, MatChip } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { CensusService } from "src/app/core/services/census/census.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { formatDate } from '@angular/common';


@Component({
    selector: 'app-census-page',
    templateUrl: './census-page.component.html',
    styleUrls: ['./census-page.component.scss'],
})
export class CensusPageComponent implements OnInit {
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;

    censusAreaNames$ : Observable<CensusAreaName[]>;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('chipList') chipList;
    constructor(
      private fb : FormBuilder,
      private census : CensusService) {}


      censusDate : FormGroup;
      censusArea : Area[];
      date : Date;
    ngOnInit(){

    this.censusDate = this.fb.group({ 
      CensusDate : [this.getCurrentDate()]
    });

    this.loadCensusData(this.censusDate.get('CensusDate').value);



    this.censusArea  = [{
      areaId:null,
      areaName:'',
      sortArea : null,
      actions :  [{
        actionId:null,
        actionName:'',
        sortAction : null,
        patients:[
          {
            patientId:null,
            tagNumber:'',
            errorCode : null

          }
        ]
      }]
      }
    ];
    

    /* Detects the change in date and vrings back the censusdata on that perticular date*/

   this.censusDate.valueChanges.subscribe(changes=>
      {
        console.log(changes);
        this.date = (changes.CensusDate).toString()
        console.log(this.date)
        this.loadCensusData(this.date);
        //  this.census.getCensusData(this.date).then(censusData => {
        //   this.censusArea = this.getSortedResponse(censusData);
        // }) 
      })
    }

    loadCensusData(censusDate : Date){
      this.census.getCensusData(censusDate).then(censusData => {
        this.censusArea = this.getSortedResponse(censusData);
    })
  }

   
    /* Sorts the arrays from censusdata object. */

    getSortedResponse(censusData){
      let sortedAreaResponse = censusData.sort((a,b)=>{return a.sortArea - b.sortArea});
      return this.getSortedAction(sortedAreaResponse)
    }


    /*Sorts the area.actions arrays from the censusdata Object and return it back tio the getSortedResponce function*/ 
    getSortedAction(areas){
      areas.forEach(area=>{
        area.actions.sort((a,b)=>{return a.sortAction - b.sortAction})
      })

      return areas;
    }

    /* Add the patients tagNumber to the chips input field*/
    addPatients(AreaId ,ActionId ,event: MatChipInputEvent): void {
        const input = event.input;
        const tag = event.value;
        if ((tag || '').trim()) {
          this.censusArea.forEach(area => {
            if(area.areaId === AreaId){
              area.actions.forEach(action=>
                {
                  if(action.actionId === ActionId)
                  {
                    console.log(area.areaId,action.actionId,tag.trim())
                     this.census.insertCensusData(area.areaId,action.actionId,tag.trim(),this.date).then(response =>
                      {
                        if(action.patients){
                        
                        action.patients.push(
                          {
                            patientId :response[0].VPatientId,
                            tagNumber : tag.trim(),
                            errorCode : response[0].VErrorCode 
                        })
                      }
                      else{
                        action.patients = [{
                          patientId :response[0].VPatientId,
                          tagNumber : tag.trim(),
                          errorCode : response[0].VErrorCode 
                      }];

                      }

                      })
                        
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
        let date = new Date();
        const wn = window.navigator as any;
        let locale = wn.languages ? wn.languages[0] : 'en-GB';
        return formatDate(date , 'yyyy-MM-dd' , locale);
      }

      setInitialTime(event: FocusEvent) {
        console.log(event)
        let currentTime;
        currentTime = this.censusDate.get(
            (event.target as HTMLInputElement).name,
        ).value;

        if (!currentTime) {
            this.censusDate.get(
                (event.target as HTMLInputElement).name,
            ).setValue(this.getCurrentDate());
        }
    }


    /* Removes the patient tagNumber from chips input field*/ 
    removePatients(AreaId , ActionId , patient): void {

      this.censusArea.forEach(area=>
        {
          if(area.areaId === AreaId){
            area.actions.forEach(action=>
              {
                if(action.actionId === ActionId){
                  this.census.deleteCensusData(area.areaId,action.actionId,patient.tagNumber,this.date);
                  let index = action.patients.indexOf(patient);
                  action.patients.splice(index , 1);
                }
              })
          }
        })
     
      
    }   
}
