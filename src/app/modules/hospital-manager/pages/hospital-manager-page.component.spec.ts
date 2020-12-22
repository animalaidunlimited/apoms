import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { HospitalManagerTabBarComponent } from '../components/hospital-manager-tab-bar/hospital-manager-tab-bar.component';

import { HospitalManagerPageComponent } from './hospital-manager-page.component';

describe('HospitalManagerPageComponent', () => {
    let component: HospitalManagerPageComponent;
    let fixture: ComponentFixture<HospitalManagerPageComponent>;

    const fakeActivatedRoute = { };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatSnackBar],
            declarations: [
                HospitalManagerPageComponent,
                HospitalManagerTabBarComponent,
            ],
            providers: [
              {
              provide: ActivatedRoute,
                useValue: fakeActivatedRoute
              }]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HospitalManagerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
