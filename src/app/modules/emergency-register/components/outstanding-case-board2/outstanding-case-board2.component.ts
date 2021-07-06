import { Component, OnInit } from '@angular/core';
import { MessagingService } from '../../services/messaging.service';
import { OutstandingCase2Service } from '../../services/outstanding-case2.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'outstanding-case-board2',
  templateUrl: './outstanding-case-board2.component.html',
  styleUrls: ['./outstanding-case-board2.component.scss']
})
export class OutstandingCaseBoard2Component implements OnInit {

  constructor( 
    private outstandingCase2Service: OutstandingCase2Service,
    private messagingService: MessagingService) { }

  ngOnInit(): void {
  }

}
