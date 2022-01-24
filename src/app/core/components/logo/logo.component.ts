import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { OrganisationOptionsService } from '../../services/organisation-option/organisation-option.service';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss'],
})
export class LogoComponent implements OnInit {

    constructor(
        private organisationOptions:OrganisationOptionsService,
        public authService: AuthService
    ) {}

    logo = 'assets/images/aau_logo.jpg';
    organisationDetail = this.organisationOptions.organisationDetail;
    
    ngOnInit() {
        if(this.authService.loggedIn?.value)
        {
            this.organisationOptions.getOrganisationDetail();
        }
        
    }

}


