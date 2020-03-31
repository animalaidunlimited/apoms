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

  addTab(emergencyCaseId:number, emergencyNumber:string) {
      this.tabs.splice(this.tabs.length, 0, {"id":this.tabs.length, "value":emergencyNumber, "emergencyCaseId":emergencyCaseId});

      this.selected.setValue(this.tabs.length - 1);
  }

  public openCase(object: any) {

    let tabExists = this.tabs.find(card => card.emergencyCaseId == object.emergencyCaseId)

    tabExists ?
      this.selected.setValue(tabExists.id)
      :
      this.addTab(object.emergencyCaseId, object.emergencyNumber);
 }
}
