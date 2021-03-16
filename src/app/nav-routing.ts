import { Route, Router } from '@angular/router';
import { Injectable } from '@angular/core';

export interface NavRoute extends Route {
    path?: string;
    icon?: string;
    group?: string;
    groupedNavRoutes?: NavRoute[];
}

export const sideNavPath = 'nav';

export const navRoutes: NavRoute[] = [
    {
        data: { title: 'Home' , userHasPermission: false},
        icon: 'home',
        path: 'home',
        loadChildren: () =>
            import('./pages/home-page/home-page.module').then(
                m => m.HomePageModule,
            ),
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    {
        data: { title: 'Emergency Register' },
        icon: 'none',
        group: '',
        path: 'emergency-register',
        loadChildren: () =>
            import(
                './modules/emergency-register/emergency-register-page.module')
                .then(m => m.EmergencyRegisterPageModule),
    },
    {
        data: { title: 'Hospital Manager', permissionId: 4 },
        icon: 'none',
        group: '',
        path: 'hospital-manager',
        loadChildren: () =>
            import(
                './modules/hospital-manager/hospital-manager-page.module')
                .then(m => m.HospitalManagerPageModule),
    },
    {
        data: { title: 'Census' },
        icon: 'none',
        group: '',
        path: 'census',
        loadChildren: () =>
            import('./modules/census/census-page.module')
            .then(m => m.CensusPageModule),
    },
    {
        data: { title: 'Case List' },
        icon: '',
        group: 'Street Treat',
        path: 'street-treat',
        loadChildren: () =>
            import(
                './modules/streettreat/streettreat-page.module')
                .then(m => m.StreetTreatPageModule),
    },
    {
        data: { title: 'Teams' },
        icon: 'none',
        group: 'Street Treat',
        path: 'teams',
        loadChildren: () =>
            import('./modules/streettreat/pages/teams-page/teams-page.module')
            .then(m => m.TeamsPageModule),
    },
    {
        data: { title: 'Reporting' },
        icon: 'none',
        group: '',
        path: 'reporting',
        loadChildren: () =>
            import('./modules/reporting/reporting-page.module')
            .then(m => m.ReportingPageModule),
    },
    {
        data: { title: 'Settings' },
        icon: 'settings_applications',
        group: 'Settings',
        path: 'settings',
        loadChildren: () =>
            import('./pages/settings-page/settings-page.module')
            .then(m => m.SettingsPageModule),
    },
    {
        data: { title: 'User Admin' },
        icon: 'none',
        group: 'Settings',
        path: 'users',
        loadChildren: () =>
            import('./pages/users-page/users-page.module')
            .then(m => m.UsersPageModule),
    },
    {
        data: { title: 'Organisations' },
        icon: 'none',
        group: 'Settings',
        path: 'organisations',
        loadChildren: () =>
            import('./pages/organisations-page/organisations-page.module')
            .then(m => m.OrganisationsPageModule),
    },
    {
        data: { title: 'Print templates' },
        icon: 'none',
        group: 'Settings',
        path: 'print-templates',
        loadChildren: () =>
            import('./modules/print-templates/print-templates-page.module')
            .then(m => m.PrintTemplatesPageModule),
    },
];

@Injectable({
    providedIn: 'root',
})

export class NavRouteService {
    navRoute!: Route;
    navRoutes: NavRoute[];

    constructor(router: Router) {

        const routes = router.config.find(route => route.path === sideNavPath);

        if(routes){
            this.navRoute = routes;
        }

        if(!this.navRoute?.children){
            throw new Error ('No routes detected');
        }

        this.navRoutes = this.navRoute?.children.filter(route => route.data && route.data.title)
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

    public getNavRoutes(): NavRoute[] {
        return this.navRoutes;
    }
}
