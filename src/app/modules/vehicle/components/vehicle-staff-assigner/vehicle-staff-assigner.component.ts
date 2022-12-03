import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { Vehicle } from 'src/app/core/models/vehicle';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-staff-assigner',
  templateUrl: './vehicle-staff-assigner.component.html',
  styleUrls: ['./vehicle-staff-assigner.component.scss']
})
export class VehicleStaffAssignerComponent implements OnInit {

  activeVehicles$!: Observable<Vehicle[]>;

  showInActive = true;

  shiftDate = this.fb.group({
    date: ['']}
  );

  

  private ngUnsubscribe = new Subject();

  constructor(
    private fb: UntypedFormBuilder,
    private vehicleService: VehicleService
  ) { }

  ngOnInit(): void {

    this.toggleInactive();

    this.shiftDate.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(changes => 
      this.vehicleService.populateVehicleShiftDetails(changes.date || "")
    );

    this.shiftDate.get("date")?.setValue(getCurrentDateString());

  }

  toggleInactive() : void {

    this.showInActive = !this.showInActive;

    this.activeVehicles$ = this.vehicleService.getVehicleListObservable().pipe(map(vehicles => vehicles.filter(vehicle => vehicle.vehicleStatusId === 1 || this.showInActive)));


  }

}
