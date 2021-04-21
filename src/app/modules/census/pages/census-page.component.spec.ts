import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CensusPageComponent } from './census-page.component';
import { CensusRecordComponent } from '../components/census-record/census-record.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('CensusPageComponent', () => {
    let component: CensusPageComponent;
    let fixture: ComponentFixture<CensusPageComponent>;
    const formBuilder: FormBuilder = new FormBuilder();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MaterialModule,
                FormsModule,
                ReactiveFormsModule,
                BrowserAnimationsModule,
                RouterTestingModule.withRoutes([]),
            ],
            providers: [{ provide: FormBuilder, useValue: formBuilder }],
            declarations: [
                CensusPageComponent, 
                CensusRecordComponent
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CensusPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
