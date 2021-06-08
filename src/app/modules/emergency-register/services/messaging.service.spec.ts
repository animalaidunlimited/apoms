import { inject, TestBed } from '@angular/core/testing';

import { MessagingService } from './messaging.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { Overlay } from '@angular/cdk/overlay';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';


describe('BoardSocketService', () => {

  let service: MessagingService;

  const formBuilder: FormBuilder = new FormBuilder();

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

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    service = TestBed.inject(MessagingService);

  }));

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
