import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusPageComponent } from './census-page.component';

describe('CensusPageComponent', () => {
    let component: CensusPageComponent;
    let fixture: ComponentFixture<CensusPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CensusPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CensusPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
