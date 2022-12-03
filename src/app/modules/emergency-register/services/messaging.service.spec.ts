import { inject, TestBed } from '@angular/core/testing';

import { MessagingService } from './messaging.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { Overlay } from '@angular/cdk/overlay';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';


describe('BoardSocketService', () => {

  let service: MessagingService;

  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        AngularFireMessagingModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        AngularFireModule.initializeApp(environment.firebase)
      ],
      providers: [
        MessagingService,
        MatSnackBar,
        Overlay,
        SnackbarService
      ]
    });

  });

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    service = TestBed.inject(MessagingService);

  }));

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
