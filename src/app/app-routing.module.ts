import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules, RouteReuseStrategy } from '@angular/router';
import { navRoutes, sideNavPath } from './nav-routing';
import { NavComponent } from './core/components/nav/nav.component';
import { AuthGuard } from './auth/auth.guard';
import { CustomRouteReuseStrategy } from './core/nav-reuse-strategy';
import { NavGuard } from './core/nav.guard';
import { PrintContentComponent } from './modules/print-templates/components/print-content/print-content.component';
import { PrintWrapperComponent } from './modules/print-templates/components/print-wrapper/print-wrapper.component';
import { TreatmentListComponent } from './modules/treatment-list/components/treatment-list/treatment-list.component';

export const routes: Routes = [
    {
        path: 'settings',
        loadChildren: () =>
            import('./pages/settings-page/settings-page.module').then(
                m => m.SettingsPageModule
            )
    },
    {
        path: 'reporting',
        loadChildren: () =>
            import('./modules/reporting/reporting-page.module')
            .then(m => m.ReportingPageModule)
    },
    {
        path: 'surgery-register',
        loadChildren: () =>
            import(
                './modules/surgery-register/surgery-register-page.module'
            ).then(m => m.SurgeryRegisterPageModule)
    },
    {
        path: 'hospital-manager',
        loadChildren: () =>
            import(
                './modules/hospital-manager/hospital-manager-page.module'
            ).then(m => m.HospitalManagerPageModule),
    },
    {
        path: 'emergency-register',
        loadChildren: () =>
            import(
                './modules/emergency-register/emergency-register-page.module'
            ).then(m => m.EmergencyRegisterPageModule),
    },
    {
        path: 'login',
        loadChildren: () =>
            import('./pages/login-page/login-page.module').then(
                m => m.LoginPageModule,
            ),
    },
    {
        path: 'treatment-list',
        loadChildren: () =>
            import('./modules/treatment-list/treatment-list-page.module').then(
                m => m.TreatmentListPageModule,
            ),
    },
    {
        path: 'print',
        outlet: 'print',
        component: PrintWrapperComponent,
        canActivate: [AuthGuard],
        canActivateChild: [NavGuard],
        children: [
        { path: 'print-content/:printTemplate', component: PrintContentComponent }
        ]
    },
    {
        path: 'treatment-list',
        outlet: 'treatment-list',
        component: PrintWrapperComponent,
        canActivate: [AuthGuard],
        canActivateChild: [NavGuard],
        children: [
        { path: 'treatment-list/:treatmentList', component: TreatmentListComponent }
        ]
    },
    {
        path: sideNavPath,
        component: NavComponent,
        children: navRoutes,
        canActivate: [AuthGuard],
        canActivateChild: [NavGuard]
    },
    {
        path: '**',
        redirectTo: 'login',
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation:'reload' }),
    ],
    exports: [RouterModule],
    providers: [
        { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }
    ],
})
export class AppRoutingModule {}
