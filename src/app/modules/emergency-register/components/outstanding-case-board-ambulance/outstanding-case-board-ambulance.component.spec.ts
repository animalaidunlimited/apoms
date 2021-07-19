import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutstandingCaseBoardAmbulanceComponent } from './outstanding-case-board-ambulance.component';


describe('OutstandingCaseBoardAmbulanceComponent', () => {
    let component: OutstandingCaseBoardAmbulanceComponent;
    let fixture: ComponentFixture<OutstandingCaseBoardAmbulanceComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
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