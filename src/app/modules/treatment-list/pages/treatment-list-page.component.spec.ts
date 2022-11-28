import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material-module';
import { sideNavPath } from 'src/app/nav-routing';
import { environment } from 'src/environments/environment';

import { TreatmentListPageComponent } from './treatment-list-page.component';

describe('TreatmentListPageComponent', () => {
  let component: TreatmentListPageComponent;
  let fixture: ComponentFixture<TreatmentListPageComponent>;

  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();


  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [
      HttpClientTestingModule,
      FormsModule,
      MaterialModule,
      ReactiveFormsModule,
      BrowserAnimationsModule,
      AngularFireMessagingModule,
      AngularFireModule.initializeApp(environment.firebase),
      RouterTestingModule.withRoutes([
        {
            path: sideNavPath,
            children: [],
        }
      ])
    ],
      declarations: [ TreatmentListPageComponent ],
      providers: [
        MatSnackBar,
        Overlay,
        { provide: UntypedFormBuilder, useValue: formBuilder }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    fixture = TestBed.createComponent(TreatmentListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
