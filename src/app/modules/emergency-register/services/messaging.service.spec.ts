import { TestBed } from '@angular/core/testing';

import { MessagingService } from './messaging.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';


describe('BoardSocketService', () => {
  let service: MessagingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,
        AngularFireMessagingModule,
        AngularFireModule.initializeApp(environment.firebase), ],
      providers: [MessagingService]
    });
    service = TestBed.inject(MessagingService);
  });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
