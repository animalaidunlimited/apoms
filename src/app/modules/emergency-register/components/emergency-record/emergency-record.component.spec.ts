import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { EmergencyRecordComponent } from './emergency-record.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EmergencyRecordComponent', () => {
  let component: EmergencyRecordComponent;
  let fixture: ComponentFixture<EmergencyRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, MaterialModule,
        BrowserAnimationsModule],
      declarations: [ EmergencyRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(EmergencyRecordComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
