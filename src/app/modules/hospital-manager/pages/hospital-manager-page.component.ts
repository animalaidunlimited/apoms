import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CaseService } from '../../emergency-register/services/case.service';
import { HospitalManagerTabBarService } from '../services/hospital-manager-tab-bar.service';

@Component({
    selector: 'hospital-manager-page',
    templateUrl: './hospital-manager-page.component.html',
    styleUrls: ['./hospital-manager-page.component.scss'],
})
export class HospitalManagerPageComponent implements OnInit {


    tagNumber = 0;
    private ngUnsubscribe = new Subject();

    constructor(route: ActivatedRoute,
        private caseService: CaseService,
        private tabBar: HospitalManagerTabBarService) {

        route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
            if(route.snapshot.params.tagNumber){

                const searchTerm = `p.TagNumber=${route.snapshot.params.tagNumber}`;

            this.caseService.searchCases(searchTerm).pipe(takeUntil(this.ngUnsubscribe)).subscribe(result => {
                this.tabBar.addTab(result);
            });

            }

        });


    }

    ngOnInit() {}
}
