import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LocationDetailsComponent } from './location-details.component';
import { ReactiveFormsModule, UntypedFormBuilder, FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MaterialModule } from 'src/app/material-module';

describe('LocationDetailsComponent', () => {
    let component: LocationDetailsComponent;
    let fixture: ComponentFixture<LocationDetailsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                MaterialModule
            ],

            declarations: [LocationDetailsComponent],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        fixture = TestBed.createComponent(LocationDetailsComponent);
        component = fixture.componentInstance;

        component.recordForm = fb.group({
            emergencyDetails: fb.group({
                emergencyCaseId: [1],
                updateTime: [''],
            }),
            callOutcome: fb.group({
                callOutcome: [''],
            }),
        });

        fixture.detectChanges();
    }));

    // TODO put this test back in when we've got a better example of how to use a Google Map in a test

    // it('should create', () => {
    //   expect(component).toBeTruthy();
    // });
});
