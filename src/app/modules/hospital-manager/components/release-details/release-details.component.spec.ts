import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';

import { ReleaseDetailsComponent } from './release-details.component';

describe('ReleaseDetailsComponent', () => {
  let component: ReleaseDetailsComponent;
  let fixture: ComponentFixture<ReleaseDetailsComponent>;

  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReleaseDetailsComponent ],
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
    ],
    providers: [
        { provide: UntypedFormBuilder, useValue: formBuilder }
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    fixture = TestBed.createComponent(ReleaseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
