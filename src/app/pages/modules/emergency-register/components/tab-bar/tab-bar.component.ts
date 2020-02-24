import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})


export class TabBarComponent {

  tabs = [{"id":0, "vvalue": "Search"}];

  selected = new FormControl(0);

  removeTab(index: number) {

    this.tabs.splice(index, 1);
  }

  addTab() {
      this.tabs.splice(this.tabs.length, 0, {"id":this.tabs.length, "vvalue":`New Call*`});
      this.selected.setValue(this.tabs.length - 1);
  }
}
