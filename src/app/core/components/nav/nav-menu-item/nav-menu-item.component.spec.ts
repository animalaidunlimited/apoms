import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NavMenuItemComponent } from './nav-menu-item.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { sideNavPath } from '../../../../nav-routing';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('NavMenuItemComponent', () => {
    let component: NavMenuItemComponent;
    let fixture: ComponentFixture<NavMenuItemComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [NavMenuItemComponent],
            imports: [
                MatIconModule,
                MatExpansionModule,
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    {
                        path: sideNavPath,
                        children: [],
                    },
                ]),
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavMenuItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
