import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivateChild,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { NavigationService } from './services/navigation/navigation.service';
import { sideNavPath } from '../nav-routing';
import { EvaluatePermissionService } from './services/permissions/evaluate-permission.service';

@Injectable({
    providedIn: 'root',
})

export class NavGuard implements CanActivateChild {
    private previousUrl = '';
    userHasPermission: BehaviorSubject<number| undefined> = new BehaviorSubject<number | undefined>(undefined);

    constructor(private navigationService: NavigationService,
        private permissionService:EvaluatePermissionService,
        private router: Router
    ) {}

    async canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ):Promise<boolean | UrlTree>
 {

        return await this.permissionService.permissionTrueOrFalse(childRoute.data.permissionId).then(val=> {
            this.userHasPermission.next(val);
            console.log(this.userHasPermission.value)
            if (childRoute.data && childRoute.data.title && !!this.userHasPermission.value) {
                // tslint:disable-next-line:no-non-null-assertion
                const parentPath: string = childRoute.parent!.url
                    .map(url => url.path)
                    .join('/');
    
                if (parentPath === sideNavPath) {
                    this.navigationService.selectNavigationItemByPath(
                        childRoute.url.map(url => url.path).join('/'),
                    );
                }
                const noQueryParamsSateUrl = state.url
                    .split('?')[0]
                    .split('/')
                    .filter(urlSegment => {
                        return urlSegment !== sideNavPath;
                    })
                    .join('/');
                while (
                    this.previousUrl.indexOf(noQueryParamsSateUrl) === 0 &&
                    noQueryParamsSateUrl.length <
                        this.navigationService.getCurrentUrl().join('/').length
                ) {
                    this.navigationService.popFromStack();
                }
                this.previousUrl = noQueryParamsSateUrl;
                this.navigationService.setActivePage(
                    childRoute.data.title,
                    childRoute.url.map(url => url.path),
                    childRoute.data.isChild,
                    !!this.userHasPermission.value
                );
    
    
            }
             // If we're on mobile close the sidenav after navigation

            if(window.innerWidth < 840){
                this.navigationService.closeIsOpen();
            }

            if(!this.userHasPermission.value) {
                this.router.navigate(['home'])
            }

            console.log(!!this.userHasPermission.value);

            return !!this.userHasPermission.value;

            
        })

       
        

        
    }
}
