import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SurgeryRegisterPageComponent } from './surgery-register-page.component';

describe('SurgeryRegisterPageComponent', () => {
    let component: SurgeryRegisterPageComponent;
    let fixture: ComponentFixture<SurgeryRegisterPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SurgeryRegisterPageComponent],
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
