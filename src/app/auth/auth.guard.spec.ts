import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
} from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

class MockAuthService {
    redirectUrl = '';
    token = '';

    isLogged() {
        return '';
    }
}

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let service: AuthService;
    let router: Router;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([]),
            ],
            providers: [
                { provide: AuthService, useClass: MockAuthService },
                AuthGuard,
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        });
        guard = TestBed.inject(AuthGuard);
        service = TestBed.inject(AuthService);
        router = TestBed.inject(Router);
    }));

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });

    describe('canActivate', () => {
        it('set the redirectUrl to null and return true', () => {

            spyOnProperty(service.loggedIn, 'value', 'get').and.returnValue(true);

            expect(
                guard.canActivate(
                    {} as ActivatedRouteSnapshot,
                    { url: 'fakeUrl' } as RouterStateSnapshot,
                ),
            ).toEqual(true);

            expect(service.redirectUrl).toEqual('');
        });

        it('should set the redirectUrl, call router.navigate, and return false', fakeAsync(() => {
            spyOn(router, 'navigate');
            spyOnProperty(service.loggedIn, 'value', 'get').and.returnValue(false);

            expect(
                guard.canActivate(
                    {} as ActivatedRouteSnapshot,
                    { url: 'fakeUrl' } as RouterStateSnapshot,
                ),
            ).toEqual(false);
            expect(service.redirectUrl).toEqual('fakeUrl');
            tick(10);
            expect(router.navigate).toHaveBeenCalledWith([ '' ]);
        }));
    });
});
