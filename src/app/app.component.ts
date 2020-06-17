import { Component } from '@angular/core';
import { MessagingService } from './modules/emergency-register/services/board-socket.service';
import { AngularFireMessaging } from '@angular/fire/messaging';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    // test
    title = 'apoms';
    message;

    constructor(private afMessaging: AngularFireMessaging,
        private messagingService: MessagingService) {

     }

    ngOnInit() {
        this.messagingService.requestPermission();
        this.message = this.messagingService.currentMessage;
      }


}
