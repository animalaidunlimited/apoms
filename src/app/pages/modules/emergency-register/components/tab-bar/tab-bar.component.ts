import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})


export class TabBarComponent {

  tabs = [{"id":0, "value": "Search", "emergencyCaseId": 0}];

  selected = new FormControl(0);

  removeTab(index: number) {

    this.tabs.splice(index, 1);
  }

  addTab(caseId:number) {
      this.tabs.splice(this.tabs.length, 0, {"id":this.tabs.length, "value":`New Call*`, "emergencyCaseId":caseId});
      this.selected.setValue(this.tabs.length - 1);
  }

  public openCase(caseId: number) {

    //TODO check if the case already exists and go to the tab if it does.
    //Otherwise add a new tab
    this.addTab(caseId);
 }
}
