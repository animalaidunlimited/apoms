import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';

import { SurgeryRecordComponent } from './surgery-record.component';
import { ReactiveFormsModule, UntypedFormBuilder, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SurgeryRecordComponent', () => {
    let component: SurgeryRecordComponent;
    let fixture: ComponentFixture<SurgeryRecordComponent>;

    const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MaterialModule,
                FormsModule,
                ReactiveFormsModule,
                BrowserAnimationsModule,
            ],
            providers: [{ provide: UntypedFormBuilder, useValue: formBuilder }],
            declarations: [SurgeryRecordComponent],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        fixture = TestBed.createComponent(SurgeryRecordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
