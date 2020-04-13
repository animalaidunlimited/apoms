import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'outstanding-case-board',
  templateUrl: './outstanding-case-board.component.html',
  styleUrls: ['./outstanding-case-board.component.scss']
})
export class OutstandingCaseBoardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  received = [
    '14324',
    '14325',
    '14326',
    '14327'
  ];

  assigned = [
    '14335',
    '14397',
    '14353',
    '14391'
  ];

  arrived = [
    '14345',
    '14323',
    '14367',
    '14398'
  ];

  rescued = [
    '14249',
    '14535',
    '14456'
  ];

  admitted = [
    '14452',
    '14362',
    '14167'
  ];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }

}
