import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';

import { EmergencyRegisterPageComponent } from './emergency-register-page.component';

describe('EmergencyRegisterPageComponent', () => {
    let component: EmergencyRegisterPageComponent;
    let fixture: ComponentFixture<EmergencyRegisterPageComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [
                EmergencyRegisterPageComponent
            ],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                AngularFireModule.initializeApp(environment.firebase)],
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
