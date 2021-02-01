import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCasePageComponent } from './add-case-page.component';

describe('AddCasePageComponent', () => {
    let component: AddCasePageComponent;
    let fixture: ComponentFixture<AddCasePageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AddCasePageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AddCasePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
