import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material-module';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { StreetTreatRecordComponent } from './streettreat-record.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';

describe('StreettreatRecordComponent', () => {
  let component: StreetTreatRecordComponent;
  let fixture: ComponentFixture<StreetTreatRecordComponent>;

  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

  const permissions$ = of({componentPermissionLevel: 2});

  const fakeActivatedRoute = { data: permissions$ };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        AngularFireModule.initializeApp(environment.firebase)
    ],
    providers: [
      DatePipe,
      { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      { provide: UntypedFormBuilder, useValue: formBuilder }
    ],
    declarations: [ StreetTreatRecordComponent ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    fixture = TestBed.createComponent(StreetTreatRecordComponent);
    component = fixture.componentInstance;

    component.inputStreetTreatCase = {
      id: 1,
      value:  undefined,
      streetTreatCaseId: 2
    };

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
