import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
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
  states!: any;
  showComplete = false;

  constructor( private fb: FormBuilder,
    private driverView: DriverViewService,
    private locationService: LocationService,
    private router: Router) { }

  ngOnInit(): void {

    this.locationService.initialise()


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
    this.driverView.populateDriverView(date);

    this.states = this.driverView.driverViewDetails.pipe(map(driverAssignments=> {

      let statesList = new Set(driverAssignments.map(assignments=> assignments.actionStatus));
      return statesList;
    }));

  }


  showCompleteList() {

    this.showComplete = !this.showComplete;
    // this.router.navigate(['/nav/completed-assignments']);
  }


}
