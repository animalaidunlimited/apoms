import { Component, Input, OnInit } from '@angular/core';
import { DriverViewService } from '../../services/driver-view.service';

@Component({
  selector: 'app-driver-view-assignment',
  templateUrl: './driver-view-assignment.component.html',
  styleUrls: ['./driver-view-assignment.component.scss']
})
export class DriverViewAssignmentComponent implements OnInit {

  @Input() actionStatus!: string;

  constructor(private driverView: DriverViewService ) { }

  ngOnInit(): void {



  }

}
