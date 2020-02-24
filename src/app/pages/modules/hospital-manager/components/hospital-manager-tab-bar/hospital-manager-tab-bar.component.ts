import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'hospital-manager-tab-bar',
  templateUrl: './hospital-manager-tab-bar.component.html',
  styleUrls: ['./hospital-manager-tab-bar.component.scss']
})
export class HospitalManagerTabBarComponent {

  tabs = [{"id":0, "value": "Search"}];

  selected = new FormControl(0);

  removeTab(index: number) {

    this.tabs.splice(index, 1);
  }

  addTab() {
      this.tabs.splice(this.tabs.length, 0, {"id":this.tabs.length, "value":`New Patient ${this.tabs.length - 1}`});
      this.selected.setValue(this.tabs.length - 1);  
  }
}
