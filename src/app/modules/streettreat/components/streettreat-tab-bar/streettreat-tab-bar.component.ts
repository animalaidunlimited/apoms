import { Component, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import { StreetTreatTab } from 'src/app/core/models/streettreet';
import { SearchStreetTreatResponse } from 'src/app/core/models/responses';
import { StreetTreatTabBarService } from '../../services/streettreat-tab-bar.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-streettreat-tab-bar',
  templateUrl: './streettreat-tab-bar.component.html',
  styleUrls: ['./streettreat-tab-bar.component.scss']
})
export class StreetTreatTabBarComponent implements OnInit {
  tabs:StreetTreatTab[] = [];
  constructor(
    private tabBarService: StreetTreatTabBarService,
    private cdr: ChangeDetectorRef
  ) { }
  selected = new FormControl(0);

  ngOnInit(): void {
    this.addEmptyTab('Case list',0);
    this.addEmptyTab('Search',1);
    this.tabBarService.tabCreator.subscribe(newTab => {
      newTab.forEach((elem) => this.addTab(elem));
  });
  }

  addEmptyTab(value: string, id : number) {

    this.tabs.push({
      id,
      value,
      streetTreatCaseId: 0
    });

    this.selected.setValue(0);
}

  addTab(streetTreatResult:SearchStreetTreatResponse) {
   this.tabs.splice(this.tabs.length, 0, {
        id: this.tabs.length,
        value: streetTreatResult.TagNumber,
        streetTreatCaseId:streetTreatResult.StreetTreatCaseId,
        emergencyCaseId:streetTreatResult.EmergencyCaseId,
        patientId:streetTreatResult.PatientId,
        currentLocation:streetTreatResult.CurrentLocation,
        icon: 'close',
    });

    setTimeout(() => {
      this.selected.setValue(this.tabs.length - 1);
      this.cdr.detectChanges();
    });
  }

  removeTab(index: number) {
    if (index > 0 && index < this.tabs.length) {
        this.tabs.splice(index, 1);
        this.selected.setValue(this.tabs.length - 1);
    }
  }

  public openCase(result: SearchStreetTreatResponse) {
    const tabExists = this.tabs.find(card =>card.streetTreatCaseId === result.StreetTreatCaseId,);
    tabExists ? this.selected.setValue(tabExists.id) : this.addTab(result);
  }
}
