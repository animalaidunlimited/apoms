import { Component, OnInit } from '@angular/core';
import { PrintTemplateService } from '../../print-templates/services/print-template.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'emergency-register-page',
    templateUrl: './emergency-register-page.component.html',
    styleUrls: ['./emergency-register-page.component.scss'],
})
export class EmergencyRegisterPageComponent implements OnInit {
    constructor(
        private printService: PrintTemplateService) {}

    ngOnInit() {

        this.printService.initialisePrintTemplates();

    }
}
