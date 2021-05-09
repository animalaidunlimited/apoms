import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { MaterialModule } from 'src/app/material-module';
import { sideNavPath } from 'src/app/nav-routing';
import { HospitalManagerTabBarComponent } from '../components/hospital-manager-tab-bar/hospital-manager-tab-bar.component';

import { HospitalManagerPageComponent } from './hospital-manager-page.component';

describe('HospitalManagerPageComponent', () => {
    let component: HospitalManagerPageComponent;
    let fixture: ComponentFixture<HospitalManagerPageComponent>;

    const fakeActivatedRoute = { params: of({}),
            snapshot: {
                params: {
                    tagNumber: 'A378'
                }
            }};

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MaterialModule,
                BrowserAnimationsModule,
                RouterTestingModule.withRoutes([
                    {
                        path: sideNavPath,
                        children: [],
                    },
                ])
            ],
            declarations: [
                HospitalManagerPageComponent,
                HospitalManagerTabBarComponent,
            ],
            providers: [
                MatSnackBar,
              {
              provide: ActivatedRoute,
                useValue: fakeActivatedRoute
              }],
              schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HospitalManagerPageComponent);
        TestBed.inject(ActivatedRoute);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
