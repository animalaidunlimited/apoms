import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TreatmentAreaHistoryComponent } from './treatment-area-history.component';


describe('TreatmentAreaHistoryComponent', () => {
    let component: TreatmentAreaHistoryComponent;
    let fixture: ComponentFixture<TreatmentAreaHistoryComponent>;

    const formBuilder: FormBuilder = new FormBuilder();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                BrowserAnimationsModule,
                OverlayModule,
                FormsModule,
                ReactiveFormsModule,
                BrowserAnimationsModule

            ],
            providers: [
                MatSnackBar,
                { provide: FormBuilder, useValue: formBuilder }
            ],
            declarations: [TreatmentAreaHistoryComponent],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(TreatmentAreaHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
