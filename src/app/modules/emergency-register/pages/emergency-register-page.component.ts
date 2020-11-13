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

        const data = this.route.snapshot.paramMap.get('files');
        console.log(data);
        
        // this.route.params.subscribe(params=>{
        //   console.log(params.files);
        //    if(params){
        //      if(params.files) {
        //       console.log(params.files);
        //        this.tabBar.addTab(params.files);
        //      }
        //    }
        // });

    }

    // onChange(event:any) {
    //   const file = event.srcElement.files;
    //   console.log(file);

    //   this.tabBar.addTab(file);

      // console.log(event);
    // }
}
