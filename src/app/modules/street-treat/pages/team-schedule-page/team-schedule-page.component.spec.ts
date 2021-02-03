import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSchedulePageComponent } from './team-schedule-page.component';

describe('TeamSchedulePageComponent', () => {
    let component: TeamSchedulePageComponent;
    let fixture: ComponentFixture<TeamSchedulePageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TeamSchedulePageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TeamSchedulePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
