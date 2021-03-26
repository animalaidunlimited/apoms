import { TestBed, async } from '@angular/core/testing';

import { NavigationService } from './navigation.service';
import { NavRoute } from '../../../nav-routing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { EvaluatePermissionService } from '../permissions/evaluate-permission.service';
import { UserActionService } from '../user-details/user-action.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

describe('NavigationService', () => {
    let service: NavigationService;
    let http: HttpClient;

    const mockNavRouteItems: NavRoute[] = [
        { path: 'somePath', data: { title: 'someTitle' , permissionId:[2,4,6,8,10,12], componentPermissionLevel: 'someVal' } },
        { path: 'somePath2' },
        { path: 'somePath3' },
    ];

    const userService = new UserActionService(http)
    const permService = new EvaluatePermissionService(userService)
    const mockNavRouteService = {
        navRoute: {},
        navRoutes: new BehaviorSubject<NavRoute[]>([]),
        router: null,
        getNavRoutes: () => mockNavRouteItems,
        userPermissionArray: [],
        permission: true,
        userPermissions: [],
        permissionService: permService
,
        showNavRoutes:()=> {}


        
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ RouterTestingModule ],
            providers: [
                {
                    provide: NavigationService,
                    useValue: new NavigationService(mockNavRouteService),
                },
            ],
        });
        service = TestBed.get(NavigationService);
    }));

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
