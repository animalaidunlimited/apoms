import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OrganisationDetailsService } from 'src/app/core/services/organisation-details/organisation-details.service';
import { SnackbarService } from './../../../../core/services/snackbar/snackbar.service';

@Component({
  selector: 'app-rota-settings',
  templateUrl: './rota-settings.component.html',
  styleUrls: ['./rota-settings.component.scss']
})
export class RotaSettingsComponent implements OnInit {

  rotaOptions = this.fb.group({
    defaults: this.fb.group({
      periodsToShow: [4, Validators.required]
    })
  });

  constructor(
    private fb: FormBuilder,
    private organisationDetails: OrganisationDetailsService,
    private snackbar: SnackbarService
  ) { }

  ngOnInit() {

    this.organisationDetails.organisationDetail.subscribe(organisationDetails => {

      if(!organisationDetails.rotaDefaults){
          return;
      }  

      this.rotaOptions.get('defaults')?.setValue(organisationDetails.rotaDefaults);

  });
  }

  saveOrganisationRotaDetails(){

    this.organisationDetails.saveOrganisationRotaDefaults(this.rotaOptions?.get('defaults')?.value).then(response => {
      
      response.success === 1 ?
          this.snackbar.successSnackBar('Organisation rota defaults saved successfully', 'OK')
      :
          this.snackbar.errorSnackBar('An error has occurred: Error number: RSC:35','OK');

  });

  }

}
