import { Component, OnInit, ViewChild } from '@angular/core';


@Component({
    selector: 'reporting-page',
    templateUrl: './reporting-page.component.html',
    styleUrls: ['./reporting-page.component.scss'],
})

export class ReportingPageComponent implements OnInit {
 
    constructor(){}
    // constructor(private drpdwn : DropdownService,
    //     private census : CensusService,
    //     private fb : FormBuilder) {}
    
        // areaId: number;
        // censusAreas$ : Observable<CensusArea[]>;
    
        // censusArea : FormGroup;
    
        // displayString : string;
    
        // totalPatientCount : number;
    
        // patientCountInArea: PatientCountInArea[];
    
        // areaNamelabel : Array<string> = [];
    
        // dataValue : Array<number> = [];
    
        // @ViewChild(MatTable) patientDetailsTable : MatTable<any> ;
    
        // displayedColumns: string[] = ['emergencynumber', 'tagnumber', 'species','callername',
        // 'number', 'calldate' , 'calloutcome'];
    
        // patientRecords = ELEMENT_DATA;
    
    
        ngOnInit() {
    
            //     this.patientCountInArea = [{
            //         area : '',
            //         count : null
            //     }]
    
            // this.census.getCensusPatientCount().then(response =>{
            //     this.patientCountInArea = response;
            // })
        
        }
    
        // getPatientDetailsById(area:string){
        //     this.census.getPatientDetialsByArea(area).then(response=>{
        //         this.patientRecords = response;
        //     })
        // }
}
