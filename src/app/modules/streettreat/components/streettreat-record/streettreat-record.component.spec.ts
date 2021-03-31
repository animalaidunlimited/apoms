import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MaterialModule } from 'src/app/material-module';

import { StreetTreatRecordComponent } from './streettreat-record.component';

describe('StreettreatRecordComponent', () => {
  let component: StreetTreatRecordComponent;
  let fixture: ComponentFixture<StreetTreatRecordComponent>;

  const formBuilder: FormBuilder = new FormBuilder();

  const permissions$ = of({componentPermissionLevel: 2});

  const fakeActivatedRoute = { data: permissions$ };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        BrowserAnimationsModule
    ],
    providers: [
      { provide: ActivatedRoute, useValue: fakeActivatedRoute },
      { provide: FormBuilder, useValue: formBuilder }
    ],
    declarations: [ StreetTreatRecordComponent ]
    })
    .compileComponents();
  });

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
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
