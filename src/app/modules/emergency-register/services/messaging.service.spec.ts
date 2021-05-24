import { TestBed } from '@angular/core/testing';

import { MessagingService } from './messaging.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { Overlay } from '@angular/cdk/overlay';
import { MatSnackBar } from '@angular/material/snack-bar';


describe('BoardSocketService', () => {
  let service: MessagingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,
        AngularFireMessagingModule,
        AngularFireModule.initializeApp(environment.firebase), ],
      providers: [MessagingService,
        MatSnackBar,
        Overlay,
        SnackbarService]
    });
    service = TestBed.inject(MessagingService);
  });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
