import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { generateUUID } from 'src/app/core/helpers/utils';
import { EmergencyCase } from 'src/app/core/models/emergency-record';
import { Priority } from 'src/app/core/models/priority';
import { TreatmentArea } from 'src/app/core/models/treatment-lists';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { UniqueTagNumberValidator } from 'src/app/core/validators/tag-number.validator';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';

export interface DummyRecordTag {
    tagNumber: string;
  }

@Component({
    selector: 'app-settings-page',
    templateUrl: './settings-page.component.html',
    styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPageComponent implements OnInit {

    addOnBlur = true;

    releaseVersion! : string;

    constructor() {}

    ngOnInit() {

        this.releaseVersion = '1.21';
    }

    refreshApp(){
        window.location.reload();
    }


}
