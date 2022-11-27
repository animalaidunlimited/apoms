import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OutstandingCaseBoardComponent } from './outstanding-case-board.component';
import { OutstandingCaseService } from './../../services/outstanding-case.service';
import { RescueDetailsService } from './../../services/rescue-details.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessagingService } from '../../services/messaging.service';
import { AngularFireMessaging, AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';

import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedPipesModule } from 'src/app/shared-pipes.module';
describe('OutstandingCaseBoardComponent', () => {
  let component: OutstandingCaseBoardComponent;
  let fixture: ComponentFixture<OutstandingCaseBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[
  MatDialogModule,
        HttpClientTestingModule,
        FormsModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MaterialModule,
        SharedPipesModule,
        AngularFireMessagingModule,
        AngularFireModule.initializeApp(environment.firebase)
      ],
      providers:[
        OutstandingCaseService,
        RescueDetailsService,
        MessagingService,
        AngularFireMessaging,
        {
          provide: MatDialogRef,
          useValue: {}
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },

      ],
      declarations: [ OutstandingCaseBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutstandingCaseBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
