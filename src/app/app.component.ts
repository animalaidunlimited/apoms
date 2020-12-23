import { Component, OnInit } from '@angular/core';
import { MAT_DATE_LOCALE} from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';
import { PromptUpdateService } from './core/services/update/update-service.service';
import { PrintTemplateService } from './modules/print-templates/services/print-template.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [
        // TODO alter this to load from the user settings
        {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
      ]
})
export class AppComponent implements OnInit{

    isPrinting:BehaviorSubject<boolean>;
    title = 'apoms';

    constructor(
        private printService: PrintTemplateService
    ) {

        this.isPrinting = this.printService.getIsPrinting();

    }

    ngOnInit() {

    }

}
