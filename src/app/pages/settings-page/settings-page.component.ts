import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrganisationDetailsService } from './../../core/services/organisation-details/organisation-details.service';
import { SnackbarService } from './../../core/services/snackbar/snackbar.service';

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

    organisationOptions : FormGroup;

    releaseVersion! : string;

    constructor(
        private fb: FormBuilder,
        private organisationDetails : OrganisationDetailsService,
        private snackbar: SnackbarService
    ) {

        this.organisationOptions = this.fb.group({
            vehicleDefaults: this.fb.group({
                shiftStartTime : ["07:00"],
                shiftEndTime : ["23:00"],
                defaultShiftLength: [9]
            })
        });

    }

    ngOnInit() {

        this.releaseVersion = '1.23';

        this.organisationDetails.organisationDetail.subscribe(organisationDetails => {

            if(!organisationDetails.vehicleDefaults){
                return;
            }  

            this.organisationOptions.get('vehicleDefaults')?.setValue(organisationDetails.vehicleDefaults);

        });
    }

    refreshApp(){
        window.location.reload();
    }

    saveOrganisationVehicleDetails(){

        if(!this.organisationOptions?.get('vehicleDefaults')?.value){
            this.snackbar.warningSnackBar('No details to update','OK');
            return;
        }

        this.organisationDetails.saveOrganisationVehicleDefaults(this.organisationOptions?.get('vehicleDefaults')?.value).then(response => {

            response.success === 1 ?
                this.snackbar.successSnackBar('Organisation vehicle defaults saved successfully', 'OK')
            :
                this.snackbar.errorSnackBar('An error has occurred: Error number: SPC: 70','OK');

        });



    }


}
