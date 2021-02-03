import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchResponse } from 'src/app/core/models/responses';
import { SearchRecordTab } from 'src/app/core/models/search-record-tab';
import { NavigationService } from 'src/app/core/services/navigation/navigation.service';
import { HospitalManagerTabBarService } from '../../services/hospital-manager-tab-bar.service';


@Component({
    selector: 'hospital-manager-tab-bar',
    templateUrl: './hospital-manager-tab-bar.component.html',
    styleUrls: ['./hospital-manager-tab-bar.component.scss'],
})
export class HospitalManagerTabBarComponent implements OnInit {

    constructor(private tabBarService: HospitalManagerTabBarService,
        private navigationService: NavigationService){

    }

    tabs:SearchRecordTab[] = [];

    selected = new FormControl(0);

    ngOnInit() {
        this.navigationService.isSearchClicked.subscribe((clicked)=>
            {
                if(clicked)
                {
                    this.selected.setValue(0);
                }
            }
        );
        this.addEmptyTab('Search');

        // Watch for any new tabs being opened from other areas of the application.
        this.tabBarService.tabCreator.subscribe(newTab => {

            newTab.forEach(elem => this.addTab(elem));
        });

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

    removeTab(index: number) {
        if (index > 0 && index < this.tabs.length) {
            this.tabs.splice(index, 1);
            this.selected.setValue(this.tabs.length - 1);
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
            callOutcomeId: searchResult.CallOutcomeId,
            callOutcome: searchResult.CallOutcome,
            icon: 'close',
        });
        this.selected.setValue(this.tabs.length - 1);
    }

    public openCase(result: SearchResponse) {

        const tabExists = this.tabs.find(
            card =>
                card.emergencyCaseId === result.EmergencyCaseId,
        );

        tabExists ? this.selected.setValue(tabExists.id) : this.addTab(result);
    }
}
