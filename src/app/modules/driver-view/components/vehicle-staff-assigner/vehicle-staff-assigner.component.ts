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

  constructor(
    private vehicleService: VehicleService
  ) { }

  ngOnInit(): void {

    this.activeVehicles$ = this.vehicleService.getVehicleListObservable();

  }

}
