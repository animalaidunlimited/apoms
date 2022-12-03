import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';

import { VehicleVisitAssignerComponent } from './vehicle-visit-assigner.component';

describe('VehicleVisitAssignerComponent', () => {
  let component: VehicleVisitAssignerComponent;
  let fixture: ComponentFixture<VehicleVisitAssignerComponent>;
  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
                ReactiveFormsModule,
                MaterialModule,
                BrowserAnimationsModule
      ],
      providers: [ DatePipe,
        { provide: UntypedFormBuilder, useValue: formBuilder }],
      declarations: [ VehicleVisitAssignerComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    fixture = TestBed.createComponent(VehicleVisitAssignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
