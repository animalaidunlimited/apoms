import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbulanceDetailsComponent } from './ambulance-details.component';

describe('AmbulanceDetailsComponent', () => {
    let component: AmbulanceDetailsComponent;
    let fixture: ComponentFixture<AmbulanceDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ AmbulanceDetailsComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AmbulanceDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});