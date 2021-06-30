import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar'; 

@Component({
  selector: 'app-completed-assignment',
  templateUrl: './completed-assignment.component.html',
  styleUrls: ['./completed-assignment.component.scss']
})
export class CompletedAssignmentComponent implements OnInit {

  completeList: any;

  constructor(
    private router: ActivatedRoute
  ) 
  {
    
  }

  ngOnInit(): void {
    this.completeList =  history.state.data;

    console.log(this.completeList)
  }

}
