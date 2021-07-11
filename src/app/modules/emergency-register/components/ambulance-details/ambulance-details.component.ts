import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { VehicleLocationDetails } from 'src/app/core/models/location';

@Component({
    selector: 'app-ambulance-details',
    templateUrl: './ambulance-details.component.html',
    styleUrls: ['./ambulance-details.component.scss']
})
export class AmbulanceDetailsComponent implements OnInit {
    @Input() vehcileDetails!:Observable<VehicleLocationDetails>;
    constructor () {}


    ngOnInit() {
        this.vehcileDetails.subscribe(value => console.log(value));
    }
}