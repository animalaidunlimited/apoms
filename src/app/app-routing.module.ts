import { NgModule } from '@angular/core';
import {
    Routes,
    RouterModule,
    PreloadAllModules,
    RouteReuseStrategy,
} from '@angular/router';
import { navRoutes, sideNavPath } from './nav-routing';
import { NavComponent } from './core/components/nav/nav.component';
import { AuthGuard } from './auth/auth.guard';
import { CustomRouteReuseStrategy } from './core/nav-reuse-strategy';
import { NavGuard } from './core/nav.guard';

const routes: Routes = [{path: 'settings',loadChildren: () =>
                import('./pages/settings-page/settings-page.module').then(
                    m => m.SettingsPageModule,
                ),},{path: 'reporting',loadChildren: () =>
                import('./pages/reporting-page/reporting-page.module').then(
                    m => m.ReportingPageModule,
                ),},{path: 'surgery-register',loadChildren: () =>
                import('./pages/surgery-register-page/surgery-register-page.module').then(
                    m => m.SurgeryRegisterPageModule,
                ),},{path: 'census',loadChildren: () =>
                import('./pages/census-page/census-page.module').then(
                    m => m.CensusPageModule,
                ),},{path: 'hospital-manager',loadChildren: () =>
                import('./modules/hospital-manager/hospital-manager-page.module').then(
                    m => m.HospitalManagerPageModule,
                ),},{path: 'emergency-register',loadChildren: () =>
                import('./modules/emergency-register/emergency-register-page.module').then(
                    m => m.EmergencyRegisterPageModule,
                ),},
    {
        path: 'login',
        loadChildren: () =>
            import('./pages/login-page/login-page.module').then(
                m => m.LoginPageModule,
            ),
    },
    {
        path: sideNavPath,
        component: NavComponent,
        children: navRoutes,
        canActivate: [AuthGuard],
        canActivateChild: [NavGuard],
    },
    {
        path: '**',
        redirectTo: 'login',
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    ],
    exports: [RouterModule],
    providers: [
        { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
    ],
})
export class AppRoutingModule {}
