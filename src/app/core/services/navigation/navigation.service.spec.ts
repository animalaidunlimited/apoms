import { map } from 'rxjs/operators';
import { TestBed} from '@angular/core/testing';

import { NavigationService } from './navigation.service';
import { NavRoute, NavRouteService } from '../../../nav-routing';
import { EvaluatePermissionService } from '../permissions/evaluate-permission.service';
import { BehaviorSubject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserActionService } from '../user-details/user-action.service';
import { routes } from '../../../app-routing.module';
import { RouterTestingModule } from '@angular/router/testing';


describe('NavigationService', () => {
    let navigationService: NavigationService;
    let navRouteService: NavRouteService;
    let navigationItems:  NavRoute[];

    const mockNavRouteItems: BehaviorSubject<NavRoute[]> = new BehaviorSubject(routes);

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

        navigationService = TestBed.inject(NavigationService);
        navRouteService = TestBed.inject(NavRouteService);
        navigationItems = navRouteService.getNavRouteList() as NavRoute[];
        spyOn(navigationService, 'getNavigationItems').and.returnValue(new BehaviorSubject(navigationItems));
    });

    describe('navigationService', () => {
      it('should be initialized', () => {
        expect(navigationService).toBeTruthy();
      });
    });

    describe('getNavigationItems', () => {
        it('should fetch all navigiation items at initialization',() =>{
          expect(navigationService.getNavigationItems().value).toBe(navigationItems);
        });
      });

    describe('getSelectedNavigationItem', () => {
        it('should get the correct selectedNavigationItem', () => {
            const navigationItem = mockNavRouteItems?.value[0];
            navigationService.navigationItems.next(navigationItems);
            navigationService.selectNavigationItemByPath(navigationItem.path as string);
            expect((navigationService.getSelectedNavigationItem() as NavRoute).path).toBe(mockNavRouteItems?.value[0].path);
        });
    });

    describe('setActivePage', () => {
        it('should set the activePage', () => {
            navigationService.setActivePage('fakeTitle', ['fake'], true);
            const activePage = navigationService.getActivePage();
            expect(activePage.title).toEqual('fakeTitle');
            expect(activePage.isChild).toEqual(true);
        });
    });

    describe('getActivePage', () => {
        it('should get the activePage', () => {
            navigationService.setActivePage('fakeTitle', ['fake']);
            const activePage = navigationService.getActivePage();
            expect(navigationService.getActivePage()).toEqual(activePage);
        });
    });

    
});
