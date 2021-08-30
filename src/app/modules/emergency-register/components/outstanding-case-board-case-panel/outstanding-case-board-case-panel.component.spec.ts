import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedPipesModule } from 'src/app/shared-pipes.module';

import { OutstandingCaseBoardCasePanelComponent } from './outstanding-case-board-case-panel.component';

describe('OutstandingCaseBoardCasePanelComponent', () => {
    let component: OutstandingCaseBoardCasePanelComponent;
    let fixture: ComponentFixture<OutstandingCaseBoardCasePanelComponent>;
    const formBuilder: FormBuilder = new FormBuilder();
    const dialogData = {};
  
    const mockDialogRef = {
      open: jasmine.createSpy('open'),
      close: jasmine.createSpy('close'),
  };

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [ OutstandingCaseBoardCasePanelComponent ],
            imports:[MatDialogModule, CommonModule , SharedPipesModule, BrowserAnimationsModule],
            providers:[ { provide: MatDialogRef, useValue: mockDialogRef },
              { provide: MAT_DIALOG_DATA, useValue: dialogData },
              { provide: FormBuilder, useValue: formBuilder },
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
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