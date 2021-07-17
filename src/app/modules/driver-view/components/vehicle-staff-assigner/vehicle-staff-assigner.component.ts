import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { Vehicle } from 'src/app/core/models/driver-view';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-staff-assigner',
  templateUrl: './vehicle-staff-assigner.component.html',
  styleUrls: ['./vehicle-staff-assigner.component.scss']
})
export class VehicleStaffAssignerComponent implements OnInit {

  activeVehicles$!: Observable<Vehicle[]>;

  shiftDate = this.fb.group({
    date: []}
  );

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService
  ) { }

  ngOnInit(): void {

    this.activeVehicles$ = this.vehicleService.getVehicleListObservable();

    this.shiftDate.valueChanges.subscribe(changes => {
      this.vehicleService.populateVehicleShiftDetails(changes.date);
    });

    this.shiftDate.get("date")?.setValue(getCurrentDateString());




  }

}
