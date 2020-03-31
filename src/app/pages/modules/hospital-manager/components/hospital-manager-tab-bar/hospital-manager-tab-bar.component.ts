import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'hospital-manager-tab-bar',
  templateUrl: './hospital-manager-tab-bar.component.html',
  styleUrls: ['./hospital-manager-tab-bar.component.scss']
})
export class HospitalManagerTabBarComponent {

  tabs = [{"id":0, "value": "Search", "emergencyCaseId": 0, "patientId": 0, "tagNumber": "", "currentLocation": ""}];

  selected = new FormControl(0);

  removeTab(index: number) {

    this.tabs.splice(index, 1);
  }

  addTab(emergencyCaseId:number, patientId:number, tagNumber:string, currentLocation:string) {
      this.tabs.splice(this.tabs.length, 0,
        {
          "id":this.tabs.length,
          "value":tagNumber,
          "emergencyCaseId": emergencyCaseId,
          "patientId": patientId,
          "tagNumber": tagNumber,
          "currentLocation": currentLocation
    });
      this.selected.setValue(this.tabs.length - 1);
  }

  public openCase(object: any) {

    let tabExists = this.tabs.find(card => card.emergencyCaseId == object.emergencyCaseId)

    tabExists ?
      this.selected.setValue(tabExists.id)
      :
      this.addTab(object.emergencyCaseId, object.patientId, object.tagNumber, object.currentLocation);
 }
}
