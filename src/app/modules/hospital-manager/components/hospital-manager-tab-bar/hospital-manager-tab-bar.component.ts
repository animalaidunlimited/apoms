import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchResponse } from 'src/app/core/models/responses';

@Component({
    selector: 'hospital-manager-tab-bar',
    templateUrl: './hospital-manager-tab-bar.component.html',
    styleUrls: ['./hospital-manager-tab-bar.component.scss'],
})
export class HospitalManagerTabBarComponent implements OnInit {
    tabs = [];

    selected = new FormControl(0);

    ngOnInit() {
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
            callOutcome: 0,
            icon: '',
        });

        this.selected.setValue(this.tabs.length - 1);
    }

    removeTab(index: number) {
        if (index > 0 && index < this.tabs.length) {
            this.tabs.splice(index, 1);
        }
    }

    addTab(searchResult: SearchResponse) {
        this.tabs.splice(this.tabs.length, 0, {
            id: this.tabs.length,
            value: searchResult.TagNumber,
            emergencyCaseId: searchResult.EmergencyCaseId,
            emergencyNumber: searchResult.EmergencyNumber,
            patientId: searchResult.PatientId,
            tagNumber: searchResult.TagNumber,
            animalType: searchResult.AnimalType,
            currentLocation: searchResult.CurrentLocation,
            callDateTime: searchResult.CallDateTime,
            callOutcome: searchResult.CallOutcomeId,
            icon: 'close',
        });
        this.selected.setValue(this.tabs.length - 1);
    }
    
    public openCase(result: SearchResponse) {
        const tabExists = this.tabs.find(
            card =>
                card.emergencyCaseId == result.EmergencyCaseId,
        );

        tabExists ? this.selected.setValue(tabExists.id) : this.addTab(result);
    }
}
