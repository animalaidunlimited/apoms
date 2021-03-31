import { inject, TestBed } from '@angular/core/testing';

import { NavigationService } from './navigation.service';
import { NavRoute, NavRouteService } from '../../../nav-routing';
import { EvaluatePermissionService } from '../permissions/evaluate-permission.service';
import { BehaviorSubject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserActionService } from '../user-details/user-action.service';
import { routes } from '../../../app-routing.module';
import { RouterTestingModule } from '@angular/router/testing';


describe('NavigationService', () => {
    let service: NavigationService;

    const mockNavRoute:NavRoute[] = [
        { path: 'somePath', data: { title: 'someTitle' } },
        { path: 'somePath2' },
        { path: 'somePath3' },
    ];

    const mockNavRouteItems: BehaviorSubject<NavRoute[]> = new BehaviorSubject(mockNavRoute);

    const mockNavRouteService = {
        navRoute: {},
        navRoutes: new BehaviorSubject<NavRoute[]>([]),
        router: null,
        userPermissionArray:[2,4,6,8,10,12],
        permission: true,
        userPermissions:[10],
        getNavRoutes: () => mockNavRouteItems,
        permissionService: EvaluatePermissionService,
        getNavRouteList: () => null

    };

    beforeEach(async () => {

        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes(routes)
            ],
            providers: [
                NavigationService,
                NavRouteService,
                EvaluatePermissionService,
                UserActionService
            ],
        });

        service = TestBed.inject(NavigationService);
    });

    it('should be initialized',  inject([NavigationService], (navigationService: NavigationService) => {
        expect(navigationService).toBeTruthy();
      }));

      it('should be initialized', () => {
        expect(service).toBeTruthy();
      });

    describe('getNavigationItems', () => {
        it('should get the correct navigationItems', () => {
            expect(service.getNavigationItems()).toEqual(mockNavRouteItems);
        });
    });

    describe('setActivePage', () => {
        it('should set the activePage', () => {
            service.setActivePage('fakeTitle', ['fake'], true);
            const activePage = service.getActivePage();
            expect(activePage.title).toEqual('fakeTitle');
            expect(activePage.isChild).toEqual(true);
        });
    });

    describe('getActivePage', () => {
        it('should get the activePage', () => {
            service.setActivePage('fakeTitle', ['fake']);
            const activePage = service.getActivePage();
            expect(service.getActivePage()).toEqual(activePage);
        });
    });

    describe('getSelectedNavigationItem', () => {
        it('should get the correct selectedNavigationItem', () => {
            const navigationItem = mockNavRouteItems.value[0];

            if(navigationItem.path){

                service.selectNavigationItemByPath(navigationItem.path);

            }

            expect(service.getSelectedNavigationItem()).toEqual(navigationItem);
        });
    });
});
