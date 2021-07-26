import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { LocationService } from 'src/app/core/services/location/location.service';

import { Observable, Subject, timer } from 'rxjs';
import {
    concatAll,
    distinct,
    map,
  
    skipWhile,
    takeUntil,
    withLatestFrom,
} from 'rxjs/operators';
import { ActiveVehicleLocation } from 'src/app/core/models/location';
import { VehicleType } from 'src/app/core/models/driver-view';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { OutstandingAssignment2 } from 'src/app/core/models/outstanding-case';
import { OutstandingCase2Service } from '../../services/outstanding-case2.service';
import { OutstandingCaseMapComponent } from '../outstanding-case-map/outstanding-case-map.component';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'outstanding-case-board-ambulance',
    templateUrl: './outstanding-case-board-ambulance.component.html',
    styleUrls: ['./outstanding-case-board-ambulance.component.scss'],
})
export class OutstandingCaseBoardAmbulanceComponent implements OnInit, OnDestroy {

    
    @Input() vehicleId!: number;

    @Input() inMap = false;

    vehicleAssignmentList!: Observable<OutstandingAssignment2[]>;

    ambulanceCases$!: Observable<ActiveVehicleLocation>;

    vehicleType$!: Observable<VehicleType>;

    timer$!: Observable<any>;

    

    @Output() rescueEdit:EventEmitter<OutstandingAssignment2> = new EventEmitter();


    @Output() mediaDialog:EventEmitter<any> = new EventEmitter();

    @Output() openCaseEmitter:EventEmitter<OutstandingAssignment2> = new EventEmitter();

    currentCapacity!: Observable<{
        capacity: { small: number; large: number };
    }>;

    actionStatusId!: number[];

    ngUnsubscribe = new Subject();

    constructor(
        private outstandingCase2Service: OutstandingCase2Service,
        private dialog: MatDialog,
        private locationService: LocationService,
        private dropdown: DropdownService,
        private cdr:ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.actionStatusId = [2, 3, 4, 5];

        this.locationService.getActiveVehicleLocations();
        

        this.ambulanceCases$ = this.locationService.ambulanceLocations$.pipe(
            takeUntil(this.ngUnsubscribe),
            map(ambulanceLocations =>
                ambulanceLocations.filter(
                    ambulanceLocation =>
                        ambulanceLocation.vehicleDetails.vehicleId ===
                        this.vehicleId,
                ),
            ),
            skipWhile(ambulanceLocations => ambulanceLocations.length === 0),
            concatAll(),

            distinct(
                ambulanceLocations =>
                    ambulanceLocations.vehicleDetails.vehicleId,
            ),
        );

        this.vehicleAssignmentList = this.outstandingCase2Service.outstandingCases$.pipe(
            takeUntil(this.ngUnsubscribe),
            map(outstandingCases =>
                outstandingCases.filter(
                    outstandingCase =>
                        outstandingCase.assignedVehicleId === this.vehicleId,
                ),
            ),
        );

        

        this.vehicleType$ = this.dropdown.getVehicleType().pipe(
            takeUntil(this.ngUnsubscribe),
            // tslint:disable-next-line: max-line-length
            withLatestFrom(
                this.ambulanceCases$,
                (vehicleTypes, ambulanceLocation) =>
                    vehicleTypes.filter(
                        vehicleType =>
                            vehicleType.VehicleTypeId ===
                            ambulanceLocation.vehicleDetails.vehicleTypeId,
                    ),
            ),
            concatAll(),
        );

        this.currentCapacity = this.vehicleAssignmentList.pipe(
            takeUntil(this.ngUnsubscribe),
            map(vehicleAssignments => {
                let smallPatientCount = 0;
                let largePatientCount = 0;

                vehicleAssignments.forEach(vehicleAssignment => {
                    vehicleAssignment.patients.forEach(patient => {
                        if (
                            /**
                             * Release count
                             */

                            (vehicleAssignment.releaseId === null &&
                                patient.patientCallOutcomeId !== null &&
                                vehicleAssignment.rescueTime !== null) ||
                            /**
                             * Rescue count
                             */
                            (vehicleAssignment.releaseId !== null &&
                                vehicleAssignment.releaseEndDate !== null &&
                                vehicleAssignment.pickupDate !== null)
                        ) {
                            patient.animalSize === 'small'
                                ? (smallPatientCount = smallPatientCount + 1)
                                : (largePatientCount = largePatientCount + 1);
                        }
                    });
                });

                return {
                    capacity: {
                        small: smallPatientCount,
                        large: largePatientCount,
                    },
                };
            }),
        );
        
        this.timer$ = this.outstandingCase2Service.getTimer();

     
        
    }


    getOutstandingCasesByStatusId(statusId: number) {
        return this.vehicleAssignmentList.pipe(
            map(outstandingCases =>
                outstandingCases.filter(
                    outStandingCases =>
                        outStandingCases.actionStatusId === statusId,
                ),
            ),
        );
    }

    getActionStatus(statusId: number) {
        switch (statusId) {
            case 1:
                return 'Received';
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

    openMediaDialog(patientId: number, tagNumber: string | null): void {
        this.mediaDialog.emit(({patientId,tagNumber}));
    }

    openRescueEdit(outstandingCase:OutstandingAssignment2){
        this.rescueEdit.emit(outstandingCase);
    }

    openCase(caseSearchResult:OutstandingAssignment2){
        this.openCaseEmitter.emit(caseSearchResult);
    }

    openMap($event:any){

        this.dialog.open(OutstandingCaseMapComponent,
        {
            panelClass: 'outstanding-case-board-vehicle-map', 
            minWidth: '50vw',
            maxWidth: '100%',
            data: this.vehicleId
        });
    }

    ngOnDestroy(){
        
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    
    }
}
