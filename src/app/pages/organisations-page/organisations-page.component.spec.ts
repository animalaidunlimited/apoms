import { Overlay } from '@angular/cdk/overlay';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { environment } from 'src/environments/environment';
import { OrganisationsPageComponent } from './organisations-page.component';

describe('OrganisationsPageComponent', () => {
    let component: OrganisationsPageComponent;
    let fixture: ComponentFixture<OrganisationsPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule,
                ReactiveFormsModule,
                AngularFireModule.initializeApp(environment.firebase) ],
            declarations: [OrganisationsPageComponent],
            providers: [    DatePipe,
                            MatSnackBar,
                            Overlay
                        ]
        }).compileComponents();
    }));

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        fixture = TestBed.createComponent(OrganisationsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
