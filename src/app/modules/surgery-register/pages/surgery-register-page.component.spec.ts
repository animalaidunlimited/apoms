import { MaterialModule } from 'src/app/material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SurgeryRecordComponent } from '../components/surgery-record.component';

import { SurgeryRegisterPageComponent } from './surgery-register-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SurgeryRegisterPageComponent', () => {
    let component: SurgeryRegisterPageComponent;
    let fixture: ComponentFixture<SurgeryRegisterPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports:[
                FormsModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                MaterialModule,
                BrowserAnimationsModule
            ],
            declarations: [
                SurgeryRegisterPageComponent,
                SurgeryRecordComponent
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SurgeryRegisterPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
