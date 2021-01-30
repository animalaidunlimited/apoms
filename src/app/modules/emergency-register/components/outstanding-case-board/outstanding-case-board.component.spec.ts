import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {
    MatDialogRef,
    MatDialog,
    MatDialogModule,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import { OutstandingCaseBoardComponent } from './outstanding-case-board.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { RouterTestingModule } from '@angular/router/testing';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'rescue-details',
    template: '<p>Mock Rescue Details Component</p>',
})
class MockRescueDetailsComponent {}

describe('OutstandingCaseBoardComponent', () => {
    let component: OutstandingCaseBoardComponent;
    let fixture: ComponentFixture<OutstandingCaseBoardComponent>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
    };

    const dialogData = {};

    let dialog: MatDialogRef<MockRescueDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MaterialModule,
                MatDialogModule,
                BrowserAnimationsModule,
                AngularFireMessagingModule,
                RouterTestingModule,
                AngularFireModule.initializeApp(environment.firebase),
            ],
            providers: [
                MatDialog,
                Overlay,
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: dialogData,
                },
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
            ],
            declarations: [OutstandingCaseBoardComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OutstandingCaseBoardComponent);
        component = fixture.componentInstance;
        dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
