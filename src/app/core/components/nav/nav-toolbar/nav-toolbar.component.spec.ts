import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NavToolbarComponent } from './nav-toolbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('NavToolbarComponent', () => {
    let component: NavToolbarComponent;
    let fixture: ComponentFixture<NavToolbarComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NavToolbarComponent],
            imports: [
                MatIconModule,
                MatToolbarModule,
                RouterTestingModule
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    //it('should create', () => {
    //    expect(component).toBeTruthy();
    //});
});
