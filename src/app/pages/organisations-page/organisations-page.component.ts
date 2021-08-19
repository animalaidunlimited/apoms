import { Component, OnInit } from '@angular/core';
import { LogoService } from 'src/app/core/services/logo/logo.service';

@Component({
    selector: 'app-organisations-page',
    templateUrl: './organisations-page.component.html',
    styleUrls: ['./organisations-page.component.scss'],
})
export class OrganisationsPageComponent implements OnInit {
    constructor(private logoService:LogoService) {}

    ngOnInit() {}
    uploadLogo($event:Event){
  
        if((($event.target as HTMLInputElement).files as FileList).length){
            const file = (($event.target as HTMLInputElement).files as FileList)[0];
            this.logoService.uploadLogo(file, 2);
            
        }else{
            return;
        }
        
    }
}
