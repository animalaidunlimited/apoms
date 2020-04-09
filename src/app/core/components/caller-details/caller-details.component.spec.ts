import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { CallerDetailsComponent } from './caller-details.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';

import {MatAutocompleteModule} from '@angular/material/autocomplete';

describe('CallerDetailsComponent', () => {
  let component: CallerDetailsComponent;
  let fixture: ComponentFixture<CallerDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatAutocompleteModule, FormsModule, ReactiveFormsModule],
      providers: [],
      declarations: [ CallerDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(CallerDetailsComponent);
    component = fixture.componentInstance;

    component.recordForm = fb.group({

      emergencyDetails: fb.group({
        emergencyCaseId: [1],
        updateTime: ['']
      }),
      callOutcome: fb.group({
        callOutcome: ['']
      })
    });

    fixture.detectChanges();
  }));

  it('should create', () => {


    expect(component).toBeTruthy();
  });
});
