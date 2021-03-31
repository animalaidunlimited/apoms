import { TestBed, async } from '@angular/core/testing';

import { NavigationService } from './navigation.service';
import { NavRoute } from '../../../nav-routing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';

describe('NavigationService', () => {
    let service: NavigationService;


    const mockNavRouteItems: NavRoute[] = [
        { path: 'somePath', data: { title: 'someTitle' } },
        { path: 'somePath2' },
        { path: 'somePath3' },
    ];

    const mockNavRouteService = {
        navRoute: {},
        navRoutes: new BehaviorSubject<NavRoute[]>([]),
        permission: false,
        userPermissionArray: [1,2,3,4,5,6,7,8,9,10,11,12],
        userPermissions: [1,2,3,4,5,6,7,8,9,10,11,12],
        getNavRoutes: () => mockNavRouteItems,
        getNavRouteList: () => mockNavRouteItems
        //,permissionService: new NavigationService(mockUserPermissionService)
    };

        //navRoute!: Route;
    //navRoutes: BehaviorSubject<NavRoute[]> = new BehaviorSubject<NavRoute[]>([]);
    //userPermissionArray!: number[];
    //permission!: boolean;
    //userPermissions!: number[];


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ RouterTestingModule ],
            providers: [
                NavigationService
                //{
                //    provide: NavigationService,
                //    useValue: new NavigationService(mockNavRouteService),
                //},
            ],
        });
        service = TestBed.get(NavigationService);
    }));

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    //describe('getNavigationItems', () => {
    //    it('should get the correct navigationItems', () => {
    //        expect(service.getNavigationItems()).toEqual(mockNavRouteItems);
    //    });
    //});

    //describe('setActivePage', () => {
    //    it('should set the activePage', () => {
    //        service.setActivePage('fakeTitle', ['fake'], true);
    //        const activePage = service.getActivePage();
    //        expect(activePage.title).toEqual('fakeTitle');
    //        expect(activePage.isChild).toEqual(true);
    //    });
    //});

    //describe('getActivePage', () => {
    //    it('should get the activePage', () => {
    //        service.setActivePage('fakeTitle', ['fake']);
    //        const activePage = service.getActivePage();
    //        expect(service.getActivePage()).toEqual(activePage);
    //    });
    //});

    //describe('getSelectedNavigationItem', () => {
    //    it('should get the correct selectedNavigationItem', () => {
    //        const navigationItem = mockNavRouteItems[0];

    //        if(navigationItem.path){

    //            service.selectNavigationItemByPath(navigationItem.path);

    //        }

    //        expect(service.getSelectedNavigationItem()).toEqual(navigationItem);
    //    });
    //});
});
