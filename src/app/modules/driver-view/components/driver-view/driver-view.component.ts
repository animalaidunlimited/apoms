import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { User } from 'src/app/core/models/user';
import { LocationService } from 'src/app/core/services/location/location.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { DriverViewService } from '../../services/driver-view.service';
import { OutstandingCaseService } from 'src/app/modules/emergency-register/services/outstanding-case.service';

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
  timer$!: Observable<{time:string, class:string} | null>;

  constructor( private fb: FormBuilder,
    private driverView: DriverViewService,
    private locationService: LocationService,
    private dropDown: DropdownService,
    private router: Router,
    private oustandingService: OutstandingCaseService) { }

  ngOnInit(): void {

    this.locationService.initialise();


    // Start logging the location of this vehicle.
    this.locationService.beginLoggingVehicleLocation();

    this.driverViewDetails = this.fb.group({
      assignmentDate: [getCurrentTimeString()],
      secondaryRescuerId: []
    });

    this.loadDriverDetails();

    this.dropDown.getCallOutcomes();

    this.dropDown.getTreatmentAreas();
  }

  loadDriverDetails() {

    this.populateDriverView(this.driverViewDetails.get('assignmentDate')?.value);

    this.driverViewDetails.get('assignmentDate')?.valueChanges.subscribe(date=> {
      if(date) {
        this.populateDriverView(date);
      }
    });

    this.driverView.getDriverViewQuestions();



  }

  populateDriverView(date: any) {
    this.driverView.populateDriverView(date);

    this.states = this.driverView.driverViewDetails.pipe(map(driverAssignments=> {

      const vehicleIdSet = new Set(driverAssignments.map(assignments=> 
        assignments.ambulanceAction==='Rescue' ? assignments.rescueAmbulanceId :
          assignments.ambulanceAction==='Release' ? assignments.releaseAmbulanceId :
          assignments.ambulanceAction==='StreetTreat' ? assignments.streetTreatAmbulanceId :
          assignments.ambulanceAction==='STRelease' ? (assignments.streetTreatAmbulanceId ? assignments.streetTreatAmbulanceId : assignments.releaseAmbulanceId) :
          null 
        ));

      const newVehicleIdArray = Array.from(vehicleIdSet);

      this.timer$ = this.driverView.getTimer()

      this.timer$.subscribe(val=> {
        console.log(val)
      })
      

      const statesList = new Set(driverAssignments.map(assignments=> assignments.actionStatus));
      return statesList;
    }));

  }

  showCompleteList() {

    this.showComplete = !this.showComplete;
  }

  openMapComponent() {
    this.router.navigate(['/nav/case-location']);
  }

  refreshDate() {
    this.driverViewDetails.get('assignmentDate')?.setValue(getCurrentTimeString());
  }


}
