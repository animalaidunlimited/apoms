import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { OutstandingCaseBoardAmbulanceComponent } from './outstanding-case-board-ambulance.component';

describe('OutstandingCaseBoardAmbulanceComponent', () => {
    let component: OutstandingCaseBoardAmbulanceComponent;
    let fixture: ComponentFixture<OutstandingCaseBoardAmbulanceComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports:[
                MatDialogModule,
                HttpClientTestingModule,
            ],
            providers: [
                MatSnackBar,
                {
                  provide: MatDialogRef,
                  useValue: {}
                },
                { provide: MAT_DIALOG_DATA, useValue: {} },

             ],
            declarations: [ OutstandingCaseBoardAmbulanceComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OutstandingCaseBoardAmbulanceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});

