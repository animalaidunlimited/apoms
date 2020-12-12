import { Component, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { StreetTreatTab } from 'src/app/core/models/streettreet';
import { SearchStreetTreatResponse } from 'src/app/core/models/responses';
import { StreetTreatTabBarService } from '../../services/streettreat-tab-bar.service';
import { EventEmitter } from '@angular/core';
import { NgModuleCompileResult } from '@angular/compiler/src/ng_module_compiler';
@Component({
  selector: 'app-streettreat-tab-bar',
  templateUrl: './streettreat-tab-bar.component.html',
  styleUrls: ['./streettreat-tab-bar.component.scss']
})
export class StreetTreatTabBarComponent implements OnInit {
  tabs:StreetTreatTab[] = [];
  constructor(private tabBarService: StreetTreatTabBarService) { }
  selected = new FormControl(0);
  //How it is receving $event here
  ngOnInit(): void {
    this.addEmptyTab('Board',0);
    this.addEmptyTab('Search',1);
    this.tabBarService.tabCreator.subscribe(newTab => {
      newTab.forEach((elem) => this.addTab(elem));
  });
  }

  addEmptyTab(value: string, id : number) {

    this.tabs.push({
      id,
      value,
      streetTreatCaseId: 0,
      close:'',
      emergencyCaseId: 0,
      emergencyNumber: 0,
      patientId: 0,
      tagNumber: 0,
      animalType: '',
      currentLocation: '',
      callDateTime: '',
      callOutcomeId: 0,
      callOutcome: '',
      icon: ''
    });

    this.selected.setValue(this.tabs.length - 1);
}

  addTab(streetTreatResult:SearchStreetTreatResponse) {
    this.tabs.splice(this.tabs.length, 0, {
        id: this.tabs.length,
        value: streetTreatResult.TagNumber,
        streetTreatCaseId:streetTreatResult.StreetTreatCaseId,
        close:'',
        emergencyCaseId: streetTreatResult.EmergencyCaseId,
        emergencyNumber: streetTreatResult.EmergencyNumber,
        patientId: streetTreatResult.PatientId,
        tagNumber: streetTreatResult.TagNumber,
        animalType: streetTreatResult.AnimalType,
        currentLocation: streetTreatResult.CurrentLocation,
        callDateTime: streetTreatResult.CallDateTime,
        callOutcomeId: streetTreatResult.CallOutcomeId,
        callOutcome: streetTreatResult.CallOutcome,
        icon: 'close',
    });
    this.selected.setValue(this.tabs.length - 1);
  }

  removeTab(index: number) {
    if (index > 0 && index < this.tabs.length) {
        this.tabs.splice(index, 1);
        this.selected.setValue(this.tabs.length - 1);
    }
  }

  public openCase(result: SearchStreetTreatResponse) {
    console.log(result);
    const tabExists = this.tabs.find(card =>card.streetTreatCaseId === result.StreetTreatCaseId,);
    tabExists ? this.selected.setValue(tabExists.id) : this.addTab(result);
  }
}
