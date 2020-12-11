import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { StreetTreatTab } from 'src/app/core/models/streettreet';
import { SearchStreetTreatResponse } from 'src/app/core/models/responses';
@Component({
  selector: 'app-streettreat-tab-bar',
  templateUrl: './streettreat-tab-bar.component.html',
  styleUrls: ['./streettreat-tab-bar.component.scss']
})
export class StreetTreatTabBarComponent implements OnInit {

  constructor() { }
  selected = new FormControl(0);
  
  ngOnInit(): void {
    this.addEmptyTab('Search');
  }

  addEmptyTab(value: string) {

    this.tabs.push({
        id: 0,
        value,
        emergencyCaseId: 0,
        emergencyNumber: 0,
        patientId: 0,
        tagNumber: '',
        animalType: '',
        currentLocation: '',
        callDateTime: '',
        callOutcomeId: 0,
        callOutcome: '',
        icon: '',
    });

    this.selected.setValue(this.tabs.length - 1);
}

  tabs:StreetTreatTab[] = [];

  addTab(searchResult: SearchStreetTreatResponse) {
    this.tabs.splice(this.tabs.length, 0, {
        id: this.tabs.length,
        //value: searchResult.TagNumber,
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

    const tabExists = this.tabs.find(
        card =>
            card.emergencyCaseId === result.EmergencyCaseId,
    );
      console.log(result)
    tabExists ? this.selected.setValue(tabExists.id) : this.addTab(result);
  }
}
