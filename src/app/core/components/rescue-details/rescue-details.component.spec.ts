import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { RescueDetailsComponent } from './rescue-details.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RescueDetailsComponent', () => {
  let component: RescueDetailsComponent;
  let fixture: ComponentFixture<RescueDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, MaterialModule,
        BrowserAnimationsModule],
      declarations: [ RescueDetailsComponent ]
    })
    .compileComponents();
  }));
  
  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(RescueDetailsComponent);
    component = fixture.componentInstance;

    component.recordForm = fb.group({

      emergencyDetails: fb.group({
        emergencyCaseId: [1],
        callDateTime:[''],
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
