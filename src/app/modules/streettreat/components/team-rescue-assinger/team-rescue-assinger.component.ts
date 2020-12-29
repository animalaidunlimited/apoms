import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'team-rescue-assinger',
  templateUrl: './team-rescue-assinger.component.html',
  styleUrls: ['./team-rescue-assinger.component.scss']
})
export class TeamRescueAssingerComponent implements OnInit {
 
  /*Get Street Treat Visit List*/
  todo = [
    'Get to work',
    'Pick up groceries',
    'Go home',
    'Fall asleep'
  ];

  done = [
    'Get up',
    'Brush teeth',
    'Take a shower',
    'Check e-mail',
    'Walk dog'
  ];

  later = [
    'Get Things Done'
  ];

  constructor() { 
    
  }

  drop(event: CdkDragDrop<string[]>){
    if(event.previousContainer === event.container){
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
    else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }
  ngOnInit(): void {
  }

}
