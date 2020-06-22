import {
    async,
    ComponentFixture,
    TestBed,
    inject,
} from '@angular/core/testing';

import { CallerDetailsComponent } from './caller-details.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MaterialModule } from 'src/app/material-module';

import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CallerDetailsComponent', () => {
    let component: CallerDetailsComponent;
    let fixture: ComponentFixture<CallerDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatFormFieldModule,
                MaterialModule,
                NoopAnimationsModule,
                MatAutocompleteModule,
                FormsModule,
                ReactiveFormsModule,
            ],
            declarations: [CallerDetailsComponent],
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(CallerDetailsComponent);
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

    afterEach(function(done) {
        component.recordForm.reset();
        done();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Invalid form - caller name only', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');

        expect(component.recordForm.get('callerDetails').valid).toEqual(false);
    });

    it('Invalid form - caller number only', () => {
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('8956874569');

        expect(component.recordForm.get('callerDetails').valid).toEqual(false);
    });

    it('Invalid form - alternative only', () => {
        component.recordForm
            .get('callerDetails.callerAlternativeNumber')
            .setValue('8956874569');

        expect(component.recordForm.get('callerDetails').valid).toEqual(false);
    });

    it('Valid form - caller name and number only', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('8956874569');

        expect(component.recordForm.get('callerDetails').valid).toEqual(true);
    });

    it('Valid form - caller name, number, and alternative', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('8956874569');
        component.recordForm
            .get('callerDetails.callerAlternativeNumber')
            .setValue('8905797444');

        component.updateValidators();

        expect(component.recordForm.get('callerDetails').valid).toEqual(true);
    });

    it('Valid form - international number', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('+8956874569');

        expect(component.recordForm.get('callerDetails').valid).toEqual(true);
    });

    it('Invalid form - Wrong placement of +', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('8956+874569');

        expect(component.recordForm.get('callerDetails').valid).toEqual(false);
    });

    it('Invalid form - 2 +', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('++8956874569');

        expect(component.recordForm.get('callerDetails').valid).toEqual(false);
    });

    it('Invalid form - Alternative number: 2 +', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('+8956874569');
        component.recordForm
            .get('callerDetails.callerAlternativeNumber')
            .setValue('++8905797444');

        expect(component.recordForm.get('callerDetails').valid).toEqual(false);
    });

    it('Invalid form - all spaces', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('          ');

        expect(component.recordForm.get('callerDetails').valid).toEqual(false);
    });

    it('Invalid form - Letters', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('Letters are here');

        expect(component.recordForm.get('callerDetails').valid).toEqual(false);
    });

    it('Invalid form - symbols', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('6668889$%^**');

        expect(component.recordForm.get('callerDetails').valid).toEqual(false);
    });

    it('Invalid form - alternative symbols', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('6668889');
        component.recordForm
            .get('callerDetails.callerAlternativeNumber')
            .setValue('6668889$%^**');

        expect(component.recordForm.get('callerDetails').valid).toEqual(false);
    });

    it('Invalid form - alternative letter', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('6668889');
        component.recordForm
            .get('callerDetails.callerAlternativeNumber')
            .setValue('Letters here');

        expect(component.recordForm.get('callerDetails').valid).toEqual(false);
    });

    it('Invalid form - alternative all spaces', () => {
        component.recordForm
            .get('callerDetails.callerName')
            .setValue('Alfred Bumblehorn');
        component.recordForm
            .get('callerDetails.callerNumber')
            .setValue('6668889');
        component.recordForm
            .get('callerDetails.callerAlternativeNumber')
            .setValue('Letters here');

        expect(component.recordForm.get('callerDetails').valid).toEqual(false);
    });
});
