import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})


export class TabBarComponent {

  tabs = [{"id":0, "value": "Search", "emergencyCaseId": 0, "icon":""}];

  selected = new FormControl(0);

  // ngOnInit()
  // {
    // this.tabs.push({"id":0, "value": "Search", "emergencyCaseId": 0, "icon":""});
    // this.tabs.push({"id":1, "value": "70008", "emergencyCaseId": 51, "icon":""});
  // }

  removeTab(index: number) {
    //TODO find out why the ngif in the mat-label causes and error and fix
    if(index > 0 && index < this.tabs.length){
      this.tabs.splice(index, 1);
    }
  }

  addTab(emergencyCaseId:number, emergencyNumber:string) {

      this.tabs.push({"id":this.tabs.length, "value":emergencyNumber, "emergencyCaseId":emergencyCaseId, "icon":"close"});

      this.selected.setValue(this.tabs.length - 1);
  }

  public openCase(object: any) {

    let tabExists = this.tabs.find(card => card.emergencyCaseId == object.emergencyCaseId);

    tabExists ?
      this.selected.setValue(tabExists.id)
      :
      this.addTab(object.emergencyCaseId, object.emergencyNumber);

 }
}
