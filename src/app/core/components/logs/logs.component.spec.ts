import { MaterialModule } from 'src/app/material-module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogsComponent } from './logs.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AbstractControl } from '@angular/forms';

describe('LogsComponent', () => {
  let component: LogsComponent;
  let fixture: ComponentFixture<LogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [ LogsComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogsComponent);
    component = fixture.componentInstance;

    component.logsData = {
      emergencyCaseId: 70092,
      patientFormArray: [] as AbstractControl[]
    };


    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
