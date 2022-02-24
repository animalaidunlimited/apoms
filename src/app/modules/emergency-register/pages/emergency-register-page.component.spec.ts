import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material-module';
import { environment } from 'src/environments/environment';

import { EmergencyRegisterPageComponent } from './emergency-register-page.component';

describe('EmergencyRegisterPageComponent', () => {
    let component: EmergencyRegisterPageComponent;
    let fixture: ComponentFixture<EmergencyRegisterPageComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                MaterialModule,
                AngularFireModule.initializeApp(environment.firebase)],
            declarations: [
                EmergencyRegisterPageComponent
            ],
            providers: [
                MatSnackBar
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EmergencyRegisterPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
