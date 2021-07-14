

import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';
import { LocationService } from 'src/app/core/services/location/location.service';

import { Observable } from 'rxjs';
import { concatAll, distinct, map, skipWhile, tap, withLatestFrom} from 'rxjs/operators';
import { ActiveVehicleLocation } from 'src/app/core/models/location';
import { VehicleType } from 'src/app/core/models/driver-view';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { OutstandingAssigment2 } from 'src/app/core/models/outstanding-case';
import { OutstandingCase2Service } from '../../services/outstanding-case2.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'emergency-register-ambulance',
    templateUrl: './emergency-register-ambulance.component.html',
    styleUrls: ['./emergency-register-ambulance.component.scss']
})
export class EmergencyRegisterAmbulanceComponent implements OnInit{
    @Input() vehicleId!:number;


    vehicleAssigmentList!: Observable<OutstandingAssigment2[]>;

    ambulanceCases$!:Observable<ActiveVehicleLocation>;

    vehicleType$!:Observable<VehicleType>;

    actionStatusId!: number[];


    constructor (
        private outstandingCase2Service: OutstandingCase2Service,
        private dialog: MatDialog,
        private locationService: LocationService,
        private dropdown: DropdownService
    ) {}

    ngOnInit(): void {

        this.actionStatusId = [2,3,4,5];

        
        this.locationService.getActiveVehicleLocations();

        this.ambulanceCases$ = this.locationService.ambulanceLocations$.pipe(
            map(ambulanceLocations => ambulanceLocations.filter(ambulanceLocation => ambulanceLocation.vehicleDetails.vehicleId === this.vehicleId)),
            skipWhile(ambulanceLocations => ambulanceLocations.length === 0),
            concatAll(),

            distinct(ambulanceLocations => ambulanceLocations.vehicleDetails.vehicleId)
        );

   
        
        this.vehicleAssigmentList = this.outstandingCase2Service.outstandingCases$.pipe(
            map(outstandingCases => outstandingCases.filter(outstandingCase => outstandingCase.assignedVehicleId === this.vehicleId)),
        );


        this.vehicleType$ = this.dropdown.getVehicleType().pipe(
            // tslint:disable-next-line: max-line-length
            withLatestFrom(this.ambulanceCases$,(vehicleTypes,ambulanceLocation) => vehicleTypes.filter(vehicleType => vehicleType.VehicleTypeId === ambulanceLocation.vehicleDetails.vehicleTypeId)),
            concatAll()
        );

        this.vehicleAssigmentList.pipe(
            map(vehicleAssigments => {

                    let patientCount = 0;
                    let largePatientCount = 0;

                    vehicleAssigments.forEach( vehicleAssigment => {
                        /**
                         * Rescue count
                         */
                        if(vehicleAssigment.releaseId !== null && vehicleAssigment.releaseEndDate !== null && vehicleAssigment.pickupDate !== null)
                        {
                            
                            patientCount = patientCount + 1;
                        }
                        else {
                            vehicleAssigment.patients.forEach(patient =>
                                {
                                    /**
                                     * Release count
                                     */
                                    if(vehicleAssigment.releaseId === null && patient.patientCallOutcomeId !== null && vehicleAssigment.rescueTime !== null){
                                        patientCount = patientCount + 1;
                                    }

                                }
                            ); 
                        }
                    });

                    return patientCount;
                }
            )
        ).subscribe(vehicleAssigments => 
            console.log(vehicleAssigments));



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

