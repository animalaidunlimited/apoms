import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusPageComponent } from './census-page.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
            ],
            providers: [{ provide: FormBuilder, useValue: formBuilder }],
            declarations: [CensusPageComponent],
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
