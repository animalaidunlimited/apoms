import { Component, OnInit } from '@angular/core';
import { PrintTemplateService } from '../../print-templates/services/print-template.service';
import { CaseService } from '../services/case.service';
import { EmergencyRegisterTabBarService } from '../services/emergency-register-tab-bar.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'emergency-register-page',
    templateUrl: './emergency-register-page.component.html',
    styleUrls: ['./emergency-register-page.component.scss'],
})
export class EmergencyRegisterPageComponent implements OnInit {
    constructor(private printService: PrintTemplateService,
        private route: ActivatedRoute,
        private caseServie: CaseService,
        private tabBar: EmergencyRegisterTabBarService) {}

    ngOnInit() {

        this.printService.initialisePrintTemplates();

        this.route.queryParams.subscribe(params=>{
           if(params){
             if(params.addSearchMedia) {
               this.tabBar.addTab(params.addSearchMedia);
             }
           }
      
        });

    }
}
