import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { MaterialModule } from 'src/app/material-module';
import { environment } from 'src/environments/environment';

import { TreatmentListService } from './treatment-list.service';

describe('TreatmentListService', () => {
  let service: TreatmentListService;

  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        BrowserAnimationsModule,
        AngularFireMessagingModule,
        AngularFireModule.initializeApp(environment.firebase)
      ],
      providers: [
        MatSnackBar,
        Overlay,
        SnackbarService,
        TreatmentListService,
        { provide: UntypedFormBuilder, useValue: formBuilder }
    ]
    });

  });

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    service = TestBed.inject(TreatmentListService);

  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
