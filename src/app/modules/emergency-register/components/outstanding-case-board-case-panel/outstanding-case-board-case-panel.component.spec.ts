import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutstandingCaseBoardCasePanelComponent } from './outstanding-case-board-case-panel.component';

describe('OutstandingCaseBoardCasePanelComponent', () => {
    let component: OutstandingCaseBoardCasePanelComponent;
    let fixture: ComponentFixture<OutstandingCaseBoardCasePanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ OutstandingCaseBoardCasePanelComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OutstandingCaseBoardCasePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});