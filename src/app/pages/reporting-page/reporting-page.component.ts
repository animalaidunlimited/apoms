import { Component, OnInit } from '@angular/core';
import { DropdownService } from "src/app/core/services/dropdown/dropdown.service";
import { CensusArea } from 'src/app/core/models/census-details';
import { Observable } from 'rxjs';
import { FormGroup , FormBuilder } from '@angular/forms';
import { CensusService } from 'src/app/core/services/census/census.service';

interface PatientCountData{
    patientCountInArea : PatientCountInArea[],
    totalPatientCount : number
}
interface PatientCountInArea{
    area : string,
    count : number
}


@Component({
    selector: 'app-reporting-page',
    templateUrl: './reporting-page.component.html',
    styleUrls: ['./reporting-page.component.scss'],
})
export class ReportingPageComponent implements OnInit {
    areaId: number;
    constructor(private drpdwn : DropdownService,
        private census : CensusService,
        private fb : FormBuilder) {}

    censusAreas$ : Observable<CensusArea[]>;
    censusArea : FormGroup;
    patientCountData : PatientCountData[];
    displayString : string;
    totalPatientCount : number;
    patientCountInArea: PatientCountInArea[];

    ngOnInit() {

        this.patientCountData = [{
            patientCountInArea : [{
                area : '',
                count : null
            }] ,

            totalPatientCount : null
        }]

        this.census.getCensusPatientCount().then(response =>{
            this.patientCountData = response;
        })
       
    }

    

}
