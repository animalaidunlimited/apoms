import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar'; 
import { DriverViewService } from '../../services/driver-view.service';

@Component({
  selector: 'app-completed-assignment',
  templateUrl: './completed-assignment.component.html',
  styleUrls: ['./completed-assignment.component.scss']
})
export class CompletedAssignmentComponent implements OnInit {

  completeList: any;

  constructor(private driverView: DriverViewService,
    private router: Router) 
  {
    
  }

  ngOnInit(): void {
    
    this.driverView.completedAssignments.subscribe(val=> {
      this.completeList = val;
    })

  }

  changeRoute() {
    this.router.navigate(['/nav/driver-view']);
  }

}
