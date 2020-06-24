import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusDetailsComponent } from './census-details.component';

describe('CensusDetailsComponent', () => {
    let component: CensusDetailsComponent;
    let fixture: ComponentFixture<CensusDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CensusDetailsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CensusDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
