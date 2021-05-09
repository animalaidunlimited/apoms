import { TestBed, inject } from '@angular/core/testing';

import { NavGuard } from './nav.guard';
import { RouterTestingModule } from '@angular/router/testing';
import { sideNavPath } from '../nav-routing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('NavGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    {
                        path: sideNavPath,
                        children: [],
                    },
                ])
            ],
            providers: [NavGuard],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        });
    });

    it('should ...', inject([NavGuard], (guard: NavGuard) => {
        expect(guard).toBeTruthy();
    }));
});
