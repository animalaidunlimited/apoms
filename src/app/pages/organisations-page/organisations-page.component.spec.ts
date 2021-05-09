import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrganisationsPageComponent } from './organisations-page.component';

describe('OrganisationsPageComponent', () => {
    let component: OrganisationsPageComponent;
    let fixture: ComponentFixture<OrganisationsPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [OrganisationsPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OrganisationsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
