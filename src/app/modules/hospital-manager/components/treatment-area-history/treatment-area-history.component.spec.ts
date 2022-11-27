import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TreatmentAreaHistoryComponent } from './treatment-area-history.component';


describe('TreatmentAreaHistoryComponent', () => {
    let component: TreatmentAreaHistoryComponent;
    let fixture: ComponentFixture<TreatmentAreaHistoryComponent>;

    const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

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
                { provide: UntypedFormBuilder, useValue: formBuilder }
            ],
            declarations: [TreatmentAreaHistoryComponent],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        fixture = TestBed.createComponent(TreatmentAreaHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
