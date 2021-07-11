import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Vehicle } from 'src/app/core/models/driver-view';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-staff-assigner',
  templateUrl: './vehicle-staff-assigner.component.html',
  styleUrls: ['./vehicle-staff-assigner.component.scss']
})
export class VehicleStaffAssignerComponent implements OnInit {

  activeVehicles$!: Observable<Vehicle[]>;
  hours = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];

  constructor(
    private vehicleService: VehicleService
  ) { }

  ngOnInit(): void {

    this.activeVehicles$ = this.vehicleService.getVehicleListObservable();

  }




}
