import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material-module';

import { UsersPageComponent } from './users-page.component';


describe('UsersPageComponent', () => {
    let component: UsersPageComponent;
    let fixture: ComponentFixture<UsersPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ UsersPageComponent
                 ],
            imports: [
                RouterTestingModule,
                HttpClientTestingModule,
                FormsModule,
                MaterialModule,
                ReactiveFormsModule,
                BrowserAnimationsModule
            ]
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(UsersPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
