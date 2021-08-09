import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

