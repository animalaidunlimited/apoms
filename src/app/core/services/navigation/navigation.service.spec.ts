import { TestBed, async } from '@angular/core/testing';

import { NavigationService } from './navigation.service';
import { NavRoute } from '../../../nav-routing';
import { EvaluatePermissionService } from '../permissions/evaluate-permission.service';

describe('NavigationService', () => {
    let service: NavigationService;

    const mockNavRouteItems: NavRoute[] = [
        { path: 'somePath', data: { title: 'someTitle' } },
        { path: 'somePath2' },
        { path: 'somePath3' },
    ];
    
    const mockNavRouteService = {
        navRoute: {},
        navRoutes: [],
        router: null,
        userPermissionArray:[2,4,6,8,10,12],
        permission: true,
        userPermissions:[10],
        getNavRoutes: () => mockNavRouteItems,
        permissionService: EvaluatePermissionService,
        newMethod: () => null
        
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: NavigationService,
                    useValue: new NavigationService(mockNavRouteService),
                },
            ],
        });
        service = TestBed.inject(NavigationService);
    });

    it('should be created', () => {
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
            const navigationItem = mockNavRouteItems[0];

            if(navigationItem.path){

                service.selectNavigationItemByPath(navigationItem.path);

            }

            expect(service.getSelectedNavigationItem()).toEqual(navigationItem);
        });
    });
});