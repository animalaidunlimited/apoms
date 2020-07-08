import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { searchResponseWrapper } from 'src/app/core/models/responses';

@Component({
    selector: 'tab-bar',
    templateUrl: './tab-bar.component.html',
    styleUrls: ['./tab-bar.component.scss'],
})
export class TabBarComponent implements OnInit {
    selected = new FormControl(0);

    tabs = [
        { id: 0, value: 'Board', emergencyCaseId: 0, icon: '' },
        { id: 1, value: 'Search', emergencyCaseId: 0, icon: '' },
    ];

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit() {
        // this.tabs.push({"id":0, "value": "Search", "emergencyCaseId": 0, "icon":""});
        // this.tabs.push({"id":1, "value": "70008", "emergencyCaseId": 51, "icon":""});
    }

    removeTab(index: number) {
        // TODO find out why the ngif in the mat-label causes and error and fix
        if (index > 1 && index < this.tabs.length) {
            this.tabs.splice(index, 1);
        }
    }

    addTab(emergencyCaseId: number, emergencyNumber: string) {
        this.tabs.push({
            id: this.tabs.length,
            value: emergencyNumber,
            emergencyCaseId,
            icon: 'close',
        });

        setTimeout(() => {
        this.selected.setValue(this.tabs.length - 1);
        this.cdr.detectChanges();
        });
    }

    public openCase(result: searchResponseWrapper) {
        const tabExists = this.tabs.find(
            card =>
                card.emergencyCaseId == result.caseSearchResult.EmergencyCaseId,
        );

        tabExists
            ? (this.selected.setValue(tabExists.id), this.cdr.detectChanges())
            : this.addTab(
                  result.caseSearchResult.EmergencyCaseId,
                  result.caseSearchResult.EmergencyNumber.toString(),
              );
    }

    public updateEmergencyNumber(emergencyNumber: number) {
        this.tabs[this.selected.value].value = (
            emergencyNumber || 'New Case*'
        ).toString();
        this.cdr.detectChanges();
    }
}
