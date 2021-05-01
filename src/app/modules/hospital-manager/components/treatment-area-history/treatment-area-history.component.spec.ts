import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TreatmentAreaHistoryComponent } from './treatment-area-history.component';


describe('CensusDetailsComponent', () => {
    let component: TreatmentAreaHistoryComponent;
    let fixture: ComponentFixture<TreatmentAreaHistoryComponent>;


    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                BrowserAnimationsModule,
                OverlayModule
            ],
            declarations: [TreatmentAreaHistoryComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TreatmentAreaHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
