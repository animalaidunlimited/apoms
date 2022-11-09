import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedPipesModule } from 'src/app/shared-pipes.module';

import { OutstandingCaseBoardCasePanelComponent } from './outstanding-case-board-case-panel.component';

describe('OutstandingCaseBoardCasePanelComponent', () => {
    let component: OutstandingCaseBoardCasePanelComponent;
    let fixture: ComponentFixture<OutstandingCaseBoardCasePanelComponent>;
    const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();
    const dialogData = {};

    const mockDialogRef = {
      open: jasmine.createSpy('open'),
      close: jasmine.createSpy('close'),
  };

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [ OutstandingCaseBoardCasePanelComponent ],
            imports:[ MatDialogModule,
                CommonModule,
                HttpClientTestingModule,
                SharedPipesModule,
                BrowserAnimationsModule],
            providers:[
                MatSnackBar,
                { provide: MatDialogRef, useValue: mockDialogRef },
              { provide: MAT_DIALOG_DATA, useValue: dialogData },
              { provide: UntypedFormBuilder, useValue: formBuilder },
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