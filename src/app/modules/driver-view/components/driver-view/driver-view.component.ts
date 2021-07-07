import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { User } from 'src/app/core/models/user';
import { LocationService } from 'src/app/core/services/location/location.service';
import { DriverViewService } from '../../services/driver-view.service';

@Component({
  selector: 'app-driver-view',
  templateUrl: './driver-view.component.html',
  styleUrls: ['./driver-view.component.scss']
})
export class DriverViewComponent implements OnInit {

  driverViewDetails!: FormGroup;
  rescuers$!: Observable<User[]>;
  statusList!: any;

  constructor( private fb: FormBuilder,
    private driverView: DriverViewService,
    private locationService: LocationService,
    private router: Router) { }

  ngOnInit(): void {


    // Start logging the location of this vehicle.
    this.locationService.beginLoggingVehicleLocation();

    this.driverViewDetails = this.fb.group({
      assignmentDate: [getCurrentTimeString()],
      secondaryRescuerId: []
    });

    this.loadDriverDetails();
  }

  loadDriverDetails() {

    this.driverViewDetails.get('assignmentDate')?.setValue(getCurrentTimeString());

    this.driverViewDetails.get('assignmentDate')?.valueChanges.subscribe(date=> {
      console.log(date);
      if(date) {
        this.populateDriverView(date);
      }
    });


  }

  populateDriverView(date: any) {
    this.driverView.getDriverViewDetails(date).subscribe((cases) => {

      console.log(cases);

    });

    let states = this.driverView.driverViewDetails.pipe(map(assignments=>
      assignments.map(assignment=> assignment.actionStatus)
    ));

    states.subscribe(val=> {
      console.log(val);
    });
  }

  changeRoute() {
    this.router.navigate(['/nav/completed-assignments']);
  }


}
