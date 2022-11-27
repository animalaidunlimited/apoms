import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecordSearchModule } from 'src/app/core/components/record-search/record-search.module';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HospitalManagerTabBarComponent } from './hospital-manager-tab-bar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { sideNavPath } from 'src/app/nav-routing';
import { DatePipe } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('HospitalManagerTabBarComponent', () => {
    let component: HospitalManagerTabBarComponent;
    let fixture: ComponentFixture<HospitalManagerTabBarComponent>;

    beforeEach(waitForAsync(() => {
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
            providers: [ DatePipe ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
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
