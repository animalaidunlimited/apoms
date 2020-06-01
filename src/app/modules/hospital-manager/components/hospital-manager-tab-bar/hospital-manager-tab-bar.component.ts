import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchResponse, searchResponseWrapper } from 'src/app/core/models/responses';

@Component({
  selector: 'hospital-manager-tab-bar',
  templateUrl: './hospital-manager-tab-bar.component.html',
  styleUrls: ['./hospital-manager-tab-bar.component.scss']
})
export class HospitalManagerTabBarComponent implements OnInit {

  tabs = [];

  selected = new FormControl(0);

  ngOnInit(){

    this.addEmptyTab("Search");

  }

  addEmptyTab(value:string){

    this.tabs.push({"id":0, "value": value, "emergencyCaseId": 0, "emergencyNumber":0, "patientId": 0,
    "tagNumber": "","animalType":"" , "currentLocation": "", "callDateTime":"", "callOutcome": 0, "icon": ""});

    this.selected.setValue(this.tabs.length - 1);
  }

  removeTab(index: number) {

    if(index > 0 && index < this.tabs.length){
      this.tabs.splice(index, 1);
    }
  }

  addTab(searchResult:searchResponseWrapper) {

      this.tabs.splice(this.tabs.length, 0,
        {
          "id":this.tabs.length,
          "value":searchResult.caseSearchResult.TagNumber,
          "emergencyCaseId": searchResult.caseSearchResult.EmergencyCaseId,
          "emergencyNumber": searchResult.caseSearchResult.EmergencyNumber,
          "patientId": searchResult.caseSearchResult.PatientId,
          "tagNumber": searchResult.caseSearchResult.TagNumber,
          "animalType": searchResult.caseSearchResult.AnimalType,
          "currentLocation": searchResult.caseSearchResult.CurrentLocation,
          "callDateTime": searchResult.caseSearchResult.CallDateTime,
          "callOutcome": searchResult.caseSearchResult.CallOutcome,
          "icon": "close",
          
    });
      this.selected.setValue(this.tabs.length - 1);
  }

  public openCase(result: searchResponseWrapper) {

    let tabExists = this.tabs.find(card => card.emergencyCaseId == result.caseSearchResult.EmergencyCaseId)

    tabExists ?
      this.selected.setValue(tabExists.id)
      :
      this.addTab(result);
 }
}
