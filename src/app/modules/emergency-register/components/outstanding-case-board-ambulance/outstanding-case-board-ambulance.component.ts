import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LocationService } from 'src/app/core/services/location/location.service';
import { Observable, Subject,  BehaviorSubject } from 'rxjs';
import {
    concatAll,
    distinct,
    map,
    skipWhile,
    takeUntil,
    withLatestFrom,
} from 'rxjs/operators';
import { ActiveVehicleLocation } from 'src/app/core/models/location';
import { DriverAssignment } from 'src/app/core/models/driver-view';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { OutstandingCaseMapComponent } from '../outstanding-case-map/outstanding-case-map.component';
import { FilterKeys } from '../outstanding-case-board/outstanding-case-board.component';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { OutstandingAssignment } from 'src/app/core/models/outstanding-case';
import { OutstandingCaseService } from '../../services/outstanding-case.service';
import { VehicleType } from 'src/app/core/models/vehicle';


const fadeAnimation = trigger('fadeAnimation',[
    transition(':enter',[
        style({opacity: 0}),
        animate('200ms', style({opacity: 1}))
    ]),
    transition(':leave',[
        style({opacity: 1}),
        animate('200ms', style({opacity : 0}))
    ])
]);

const rescueMoved = trigger('rescueMoved',
[
  state('void', style({
    background: 'transparent'
  })),
  state('moved',style({
    background: 'lightsteelblue'

})),
state('still', style({
  background: 'transparent'
})),
transition('moved => still', [
  animate('1s')
]),
transition('still => moved', [
  animate('0s')
])

]);
@Component({
    // tslint:disable-next-line: component-selector
    selector: 'outstanding-case-board-ambulance',
    templateUrl: './outstanding-case-board-ambulance.component.html',
    styleUrls: ['./outstanding-case-board-ambulance.component.scss'],
    // animations: [fadeAnimation,rescueMoved],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutstandingCaseBoardAmbulanceComponent implements OnInit, OnDestroy {

    // Input's


    // Static Input's
    @Input() vehicleId!: number;
    @Input() inMap = false;
    @Input() filterKeysArray!: FilterKeys[];

    // Dynamic Input's
    @Input() searchChange$!:Observable<string>;

    // Properties

    // Static
    actionStatus = [
        {statusId: 2, status: "Assigned"}, {statusId: 3, status: "Arrived/Picked"}, {statusId: 4, status: "Rescued/Released"}, {statusId: 5, status: "Admitted"}
    ];

    showPlate = false;

    casesByStatusMap = new Map<number, Observable<(OutstandingAssignment | DriverAssignment)[]>>();

    // Dynamic
    vehicleAssignmentList$!: Observable<(OutstandingAssignment | DriverAssignment)[]>;
    ambulanceCases$!: Observable<ActiveVehicleLocation>;
    vehicleType$!: Observable<VehicleType>;
    timer$!: Observable<{time:string, class:string} | null>;
    currentCapacity!: Observable<{
        capacity: { small: number; large: number };
    }>;

    // Component unsubscribe handler
    ngUnsubscribe = new Subject();

    constructor(
        private outstandingCaseService: OutstandingCaseService,
        private dialog: MatDialog,
        private locationService: LocationService,
        private dropdown: DropdownService
    ) {}

    ngOnInit(): void {

        this.locationService.getActiveVehicleLocations();


        this.ambulanceCases$ = this.locationService.ambulanceLocations$.pipe(
            takeUntil(this.ngUnsubscribe),
            map(ambulanceLocations =>
                ambulanceLocations.filter(
                    ambulanceLocation =>
                        ambulanceLocation.vehicleDetails.vehicleId === this.vehicleId,
                ),
            ),
            skipWhile(ambulanceLocations => ambulanceLocations.length === 0),
            concatAll(),

            distinct(
                ambulanceLocations =>
                    ambulanceLocations.vehicleDetails.vehicleId
            )
        );



        this.vehicleAssignmentList$ = this.outstandingCaseService.getOutstandingCasesByVehicleId(this.vehicleId);

        for(let status of this.actionStatus){
            this.casesByStatusMap.set(status.statusId, this.getOutstandingCasesByStatusId(status.statusId))
        }


        this.vehicleType$ = this.dropdown.getVehicleType().pipe(
            takeUntil(this.ngUnsubscribe),
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

        this.currentCapacity = this.vehicleAssignmentList$?.pipe(
            takeUntil(this.ngUnsubscribe),
            map(vehicleAssignments => {
                let smallPatientCount = 0;
                let largePatientCount = 0;

                vehicleAssignments?.forEach(vehicleAssignment => {
                    vehicleAssignment.patients?.forEach(patient => {

                        patient.largeAnimal === 0
                            ? (smallPatientCount = smallPatientCount + 1)
                            : (largePatientCount = largePatientCount + 1);

                    });
                });

                return {
                    capacity: {
                        small: smallPatientCount,
                        large: largePatientCount
                    }
                };
            }),
        );

        this.timer$ = this.outstandingCaseService.getTimer(this.vehicleId);

    }

    getOutstandingCasesByStatusId(statusId: number) {
        return this.vehicleAssignmentList$?.pipe(
            map(outstandingCases =>
                outstandingCases.filter(
                    outStandingCases =>
                        outStandingCases.actionStatusId === statusId,
                ),
            )
        );
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