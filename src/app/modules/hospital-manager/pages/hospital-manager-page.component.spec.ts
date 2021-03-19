import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MaterialModule } from 'src/app/material-module';
import { HospitalManagerTabBarComponent } from '../components/hospital-manager-tab-bar/hospital-manager-tab-bar.component';

import { HospitalManagerPageComponent } from './hospital-manager-page.component';

describe('HospitalManagerPageComponent', () => {
    let component: HospitalManagerPageComponent;
    let fixture: ComponentFixture<HospitalManagerPageComponent>;

    const fakeActivatedRoute = { params: of({}) };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MaterialModule
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
              }]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HospitalManagerPageComponent);
        let route = TestBed.inject(ActivatedRoute);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
