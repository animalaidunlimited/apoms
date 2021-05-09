import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';

import { OutcomeComponent } from './outcome.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';
import { MatChipsModule } from '@angular/material/chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('OutcomeComponent', () => {
    let component: OutcomeComponent;
    let fixture: ComponentFixture<OutcomeComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                MaterialModule,
                MatChipsModule,
                BrowserAnimationsModule,
            ],
            declarations: [OutcomeComponent],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(OutcomeComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
