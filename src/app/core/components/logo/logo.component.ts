import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { OrganisationDetailsService } from '../../services/organisation-details/organisation-details.service';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss'],
})
export class LogoComponent implements OnInit {

    constructor(
        private organisationDetails:OrganisationDetailsService,
        public authService: AuthService
    ) {}
    
    organisationDetail = this.organisationDetails.organisationDetail;
    
    ngOnInit() {
        if(this.authService.loggedIn?.value)
        {
            this.organisationDetails.getOrganisationDetail();
        }
        
    }

}


