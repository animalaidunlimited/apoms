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
        data: { title: 'Home' },
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
{data: {title: 'Emergency Register'},icon: 'none',group: '',path: 'emergency-register',loadChildren: () =>
                import('./pages/modules/emergency-register/emergency-register-page.module').then(
                    m => m.EmergencyRegisterPageModule,
                ),},{data: {title: 'Hospital Manager'},icon: 'none',group: '',path: 'hospital-manager',loadChildren: () =>
                import('./pages/modules/hospital-manager/hospital-manager-page.module').then(
                    m => m.HospitalManagerPageModule,
                ),},{data: {title: 'Census'},icon: 'none',group: '',path: 'census',loadChildren: () =>
                import('./pages/census-page/census-page.module').then(
                    m => m.CensusPageModule,
                ),},{data: {title: 'Surgery Register'},icon: 'none',group: '',path: 'surgery-register',loadChildren: () =>
                import('./pages/surgery-register-page/surgery-register-page.module').then(
                    m => m.SurgeryRegisterPageModule,
                ),},{data: {title: 'Case List'},icon: '',group: 'Street Treat',path: 'case-list',loadChildren: () =>
                import('./street-treat/pages/case-list-page/case-list-page.module').then(
                    m => m.CaseListPageModule,
                ),},{data: {title: 'Add Case'},icon: 'none',group: 'Street Treat',path: 'add-case',loadChildren: () =>
                import('./street-treat/pages/add-case-page/add-case-page.module').then(
                    m => m.AddCasePageModule,
                ),},{data: {title: 'Team Schedule'},icon: 'none',group: 'Street Treat',path: 'team-schedule',loadChildren: () =>
                import('./street-treat/pages/team-schedule-page/team-schedule-page.module').then(
                    m => m.TeamSchedulePageModule,
                ),},{data: {title: 'Teams'},icon: 'none',group: 'Street Treat',path: 'teams',loadChildren: () =>
                import('./street-treat/pages/teams-page/teams-page.module').then(
                    m => m.TeamsPageModule,
                ),},{data: {title: 'Reporting'},icon: 'none',group: '',path: 'reporting',loadChildren: () =>
                import('./pages/reporting-page/reporting-page.module').then(
                    m => m.ReportingPageModule,
                ),},{data: {title: 'Settings'},icon: 'settings_applications',group: 'Settings',path: 'settings',loadChildren: () =>
                import('./pages/settings-page/settings-page.module').then(
                    m => m.SettingsPageModule,
                ),},{data: {title: 'Users'},icon: 'none',group: 'Settings',path: 'users',loadChildren: () =>
                import('./pages/users-page/users-page.module').then(
                    m => m.UsersPageModule,
                ),},{data: {title: 'Organisations'},icon: 'none',group: 'Settings',path: 'organisations',loadChildren: () =>
                import('./pages/organisations-page/organisations-page.module').then(
                    m => m.OrganisationsPageModule,
                ),},];

@Injectable({
    providedIn: 'root',
})
export class NavRouteService {
    navRoute: Route;
    navRoutes: NavRoute[];

    constructor(router: Router) {
        this.navRoute = router.config.find(route => route.path === sideNavPath);
        this.navRoutes = this.navRoute.children
            .filter(route => route.data && route.data.title)
            .reduce((groupedList: NavRoute[], route: NavRoute) => {
                if (route.group) {
                    const group: NavRoute = groupedList.find(navRoute => {
                        return (
                            navRoute.group === route.group &&
                            navRoute.groupedNavRoutes !== undefined
                        );
                    });
                    if (group) {
                        group.groupedNavRoutes.push(route);
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
