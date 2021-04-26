import { TestBed, waitForAsync } from '@angular/core/testing';

import { NavigationService } from './navigation.service';
import { NavRoute, NavRouteService } from '../../../nav-routing';
import { BehaviorSubject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserActionService } from '../user-details/user-action.service';
import { routes } from '../../../app-routing.module';
import { RouterTestingModule } from '@angular/router/testing';
import { EvaluatePermissionService } from '../permissions/evaluate-permission.service';


describe('NavigationService', () => {
    let service: NavigationService;

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

        service = TestBed.inject(NavigationService);
    });

    describe('navigationService', () => {
      it('should be initialized', () => {
        expect(service).toBeTruthy();
      });
    });

    describe('getNavigationItems', () => {
        it('should get the correct navigationItems', () => {
            // tslint:disable-next-line: deprecation
            service.getNavigationItems().subscribe(route => expect(route).toEqual([]));
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
            /* const navigationItem = mockNavRouteItems.value[0];

            if(navigationItem.path){
                console.log(navigationItem.path);
                console.log(service.selectNavigationItemByPath(navigationItem.path));
                service.selectNavigationItemByPath(navigationItem.path);

            }
            console.log('service.getSelectedNavigationItem()');
            console.log(service.getSelectedNavigationItem()); */
            // expect(service.getSelectedNavigationItem()).toEqual(navigationItem);
        });
    });
});
