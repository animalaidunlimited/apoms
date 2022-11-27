import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef, MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material-module';
import { sideNavPath } from 'src/app/nav-routing';

import { TabBarComponent } from './tab-bar.component';

describe('TabBarComponent', () => {
    let component: TabBarComponent;
    let fixture: ComponentFixture<TabBarComponent>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close')
      };

    const dialogData = {};

    beforeEach(async () => {
        TestBed.configureTestingModule({
          imports: [
            MatDialogModule,
            MaterialModule,
            HttpClientTestingModule,
            BrowserAnimationsModule,
            RouterTestingModule.withRoutes([{
              path: sideNavPath,
              children: [],
          }])
          ],
            declarations: [TabBarComponent],
            providers: [
              MatSnackBar,
              {
                provide: MAT_DIALOG_DATA,
                useValue: dialogData },
              {
              provide: MatDialogRef,
              useValue: mockDialogRef
            }],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TabBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
