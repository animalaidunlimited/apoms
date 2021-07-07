import { Route, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EvaluatePermissionService } from './core/services/permissions/evaluate-permission.service';

export interface NavRoute extends Route {
    path?: string;
    icon?: string;
    group?: string;
    groupedNavRoutes?: NavRoute[];
}

export const sideNavPath = 'nav';

export const navRoutes: NavRoute[] = [
    {
        data: { title: 'Home', permissionId:[], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: 'home',
        path: 'home',
        loadChildren: () =>
            import('./pages/home-page/home-page.module').then(
                m => m.HomePageModule
            )
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    {
        data: { title: 'Emergency Register', permissionId:[1,2], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: 'none',
        group: '',
        path: 'emergency-register',
        loadChildren: () =>
            import(
                './modules/emergency-register/emergency-register-page.module')
                .then(m => m.EmergencyRegisterPageModule)
    },
    {
        data: { title: 'Hospital Manager', permissionId:[3,4], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: 'none',
        group: '',
        path: 'hospital-manager',
        loadChildren: () =>
            import(
                './modules/hospital-manager/hospital-manager-page.module')
                .then(m => m.HospitalManagerPageModule)
    },
    {
        data: {title: 'Treatment List', permissionId:[7,8], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: 'none',
        group: '',
        path: 'treatment-list',
        loadChildren: () =>
            import('./modules/treatment-list/treatment-list-page.module').
            then(m => m.TreatmentListPageModule)
    },
    {
        data: { title: 'Case List', permissionId:[5,6], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: '',
        group: 'Street Treat',
        path: 'street-treat',
        loadChildren: () =>
            import(
                './modules/streettreat/streettreat-page.module')
                .then(m => m.StreetTreatPageModule)
    },
    {
        data: { title: 'Teams', permissionId:[5,6], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: 'none',
        group: 'Street Treat',
        path: 'teams',
        loadChildren: () =>
            import('./modules/streettreat/pages/teams-page/teams-page.module')
            .then(m => m.TeamsPageModule)
    },

    {
        data: { title: 'Vehicle List', permissionId:[5,6], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: 'none',
        group: 'Vehicles',
        path: 'vehicle-list',
        loadChildren: () =>
            import('./modules/driver-view/pages/vehile-list-page/vehicle-list-page.module')
            .then(m => m.VehicleListPageModule)
    },

    {
        data: { title: 'Driver View', permissionId:[5,6], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: 'none',
        group: 'Vehicles',
        path: 'driver-view',
        loadChildren: () =>
            import('./modules/driver-view/components/driver-view/driver-view.module')
            .then(m => m.DriverViewModule)
    },

    {
        data: { title: 'Reporting' ,permissionId:[9,10], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: 'none',
        group: '',
        path: 'reporting',
        loadChildren: () =>
            import('./modules/reporting/reporting-page.module')
            .then(m => m.ReportingPageModule)
    },
    {
        data: { title: 'Settings' ,permissionId:[], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: 'settings_applications',
        group: 'Settings',
        path: 'settings',
        loadChildren: () =>
            import('./pages/settings-page/settings-page.module')
            .then(m => m.SettingsPageModule)
    },
    {
        data: { title: 'User Admin' ,permissionId:[11,12], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: 'none',
        group: 'Settings',
        path: 'users',
        loadChildren: () =>
            import('./pages/users-page/users-page.module')
            .then(m => m.UsersPageModule)
    },
    {
        data: { title: 'Organisations' ,permissionId:[11,12], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: 'none',
        group: 'Settings',
        path: 'organisations',
        loadChildren: () =>
            import('./pages/organisations-page/organisations-page.module')
            .then(m => m.OrganisationsPageModule)
    },
    {
        data: { title: 'Print templates' ,permissionId:[11,12], componentPermissionLevel: new BehaviorSubject<number>(0)},
        icon: 'none',
        group: 'Settings',
        path: 'print-templates',
        loadChildren: () =>
            import('./modules/print-templates/print-templates-page.module')
            .then(m => m.PrintTemplatesPageModule)
    }

];

@Injectable({
    providedIn: 'root',
})
export class NavRouteService {
    navRoute!: Route;
    navRoutes: BehaviorSubject<NavRoute[]> = new BehaviorSubject<NavRoute[]>([]);
    userPermissionArray!: number[];
    permission!: boolean;
    userPermissions!: number[];

    constructor(router: Router, private permissionService: EvaluatePermissionService) {

        const routes = router.config.find(route => route.path === sideNavPath);

        if(routes){

            this.navRoute = routes;
        }

        if(!this.navRoute.children){
            throw new Error ('No routes detected');
        }
        this.navRoute.children?.forEach(routeVal=> {

            this.permissionService.permissionTrueOrFalse(routeVal.data?.permissionId).then(val=> {

                if(routeVal.data && val) {
                    routeVal.data.componentPermissionLevel.next(val);
                }
                this.navRoutes.next(this.getNavRouteList() || []);
            });

        });


    }

    getNavRouteList() {

        return this.navRoute.children?.filter(route => route.data && route.data.title && !!route.data.componentPermissionLevel?.value)
            .reduce((groupedList: NavRoute[], route: NavRoute) => {


                if (route.group) {
                    const group: NavRoute | undefined = groupedList.find(navRoute => {
                        return (
                            navRoute.group === route.group &&
                            navRoute.groupedNavRoutes !== undefined
                        );
                    });

                    if (group) {
                        group.groupedNavRoutes?.push(route);
                    } else {
                        groupedList.push({
                            group: route.group,
                            groupedNavRoutes: [route],
                        });
                    }
                } else {
                    groupedList.push(route);
                }
                return groupedList;
            }, []);
    }


    getNavRoutes(): BehaviorSubject<NavRoute[]>{
        return this.navRoutes;
    }



}