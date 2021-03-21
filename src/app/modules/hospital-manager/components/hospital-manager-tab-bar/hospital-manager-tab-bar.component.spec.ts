import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordSearchModule } from 'src/app/core/components/record-search/record-search.module';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HospitalManagerTabBarComponent } from './hospital-manager-tab-bar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { sideNavPath } from 'src/app/nav-routing';
import { DatePipe } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';

describe('HospitalManagerTabBarComponent', () => {
    let component: HospitalManagerTabBarComponent;
    let fixture: ComponentFixture<HospitalManagerTabBarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([{
                    path: sideNavPath,
                    children: [],
                }]),
                RecordSearchModule,
                MatTabsModule,
                MaterialModule,
                HttpClientTestingModule,
                BrowserAnimationsModule,
            ],
            declarations: [ HospitalManagerTabBarComponent ],
            providers: [ DatePipe ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HospitalManagerTabBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
