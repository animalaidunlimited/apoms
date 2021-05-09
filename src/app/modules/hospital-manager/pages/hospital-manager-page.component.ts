import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseService } from '../../emergency-register/services/case.service';
import { HospitalManagerTabBarService } from '../services/hospital-manager-tab-bar.service';

@Component({
    selector: 'hospital-manager-page',
    templateUrl: './hospital-manager-page.component.html',
    styleUrls: ['./hospital-manager-page.component.scss'],
})
export class HospitalManagerPageComponent implements OnInit {


    tagNumber = 0;

    constructor(route: ActivatedRoute,
        private caseService: CaseService,
        private tabBar: HospitalManagerTabBarService) {

        route.params.subscribe(() => {
            if(route.snapshot.params.tagNumber){

                const searchTerm = `p.TagNumber=${route.snapshot.params.tagNumber}`;

            this.caseService.searchCases(searchTerm).subscribe(result => {
                this.tabBar.addTab(result);
            });

            }

        });


    }

    ngOnInit() {}
}
