import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyRegisterAmbulanceComponent } from './emergency-register-ambulance.component';

describe('EmergencyRegisterAmbulanceComponent', () => {
    let component: EmergencyRegisterAmbulanceComponent;
    let fixture: ComponentFixture<EmergencyRegisterAmbulanceComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ EmergencyRegisterAmbulanceComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EmergencyRegisterAmbulanceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});