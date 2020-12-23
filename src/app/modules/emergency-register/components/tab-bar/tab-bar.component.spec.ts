import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { TabBarComponent } from './tab-bar.component';

describe('TabBarComponent', () => {
    let component: TabBarComponent;
    let fixture: ComponentFixture<TabBarComponent>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close')
      };

    const dialogData = {};

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TabBarComponent],
            providers: [
              {
                provide: MAT_DIALOG_DATA,
                useValue: dialogData },
              {
              provide: MatDialogRef,
              useValue: mockDialogRef
            }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TabBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
