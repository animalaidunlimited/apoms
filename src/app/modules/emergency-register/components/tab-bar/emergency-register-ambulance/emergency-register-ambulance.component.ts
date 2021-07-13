import { OutstandingAssigment2 } from './../../../../../core/models/outstanding-case';

import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';
import { LocationService } from 'src/app/core/services/location/location.service';
import { OutstandingCase2Service } from '../../../services/outstanding-case2.service';
import { Observable } from 'rxjs';
import { concatAll, distinct, map, skip, skipWhile} from 'rxjs/operators';
import { ActiveVehicleLocation, VehicleDetails, VehicleLocation, VehicleStaff } from 'src/app/core/models/location';
import { VehicleType } from 'src/app/core/models/driver-view';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'emergency-register-ambulance',
    templateUrl: './emergency-register-ambulance.component.html',
    styleUrls: ['./emergency-register-ambulance.component.scss']
})
export class EmergencyRegisterAmbulanceComponent implements OnInit{
    @Input() vehicleId!:number;


    vehicleAssigmentList!: Observable<OutstandingAssigment2[]>;

    ambulanceLocations$!:Observable<ActiveVehicleLocation>;

    vehicleType$!: Observable<VehicleType[]>;

    actionStatusId!: number[];

    constructor (
        private outstandingCase2Service: OutstandingCase2Service,
        private dialog: MatDialog,
        private locationService: LocationService,
        private dropdown: DropdownService
    ) {}

    ngOnInit(): void {

        this.actionStatusId = [2,3,4,5];


        this.vehicleType$ = this.dropdown.getVehicleType();
        
        this.locationService.getActiveVehicleLocations();

        this.ambulanceLocations$ = this.locationService.ambulanceLocations$.pipe(
            map(ambulanceLocations => ambulanceLocations.filter(ambulanceLocation => ambulanceLocation.vehicleDetails.vehicleId === this.vehicleId)),
            skipWhile(ambulanceLocations => ambulanceLocations.length === 0),
            concatAll(),

            distinct(ambulanceLocations => ambulanceLocations.vehicleDetails.vehicleId)
        );

   
        this.ambulanceLocations$.subscribe(value => console.log(value));
        
        this.vehicleAssigmentList = this.outstandingCase2Service.outstandingCases$.pipe(
            map(outstandingCases => outstandingCases.filter(outstandingCase => outstandingCase.assignedVehicleId === this.vehicleId)),
           
        );


    }

   

    getOutstandingCasesByStatusId(statusId: number){
    
    
        return this.vehicleAssigmentList.pipe(
            map(outstandingCases => outstandingCases.filter(outStandingCases => outStandingCases.actionStatusId === statusId))
        );
    
    }

    getActionStatus(statusId:number){

        switch(statusId){
            case 1: 
            return 'Received' ; 
            case 2: 
            return 'Assigned'; 
            case 3:   
            return 'Arrived/Picked'; 
            case 4: 
            return 'Rescued/Released'; 
            case 5: 
            return 'Admitted';
            default:
            return '';
        }
    
    }
    
    
    openMediaDialog(patientId: number, tagNumber: string | null): void{
    this.dialog.open(MediaDialogComponent, {
        minWidth: '50%',
        data: {
            tagNumber,
            patientId,
        }
    });

    }
    
}

