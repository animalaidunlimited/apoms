import { Component, OnInit } from '@angular/core';
import { NavigationService, Page } from '../../../../../navigation/navigation.service';
import { NavRoute } from '../../../nav-routing';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
    isOpen: BehaviorSubject<boolean>;
    screenWidth = 0;

    constructor(
        private navigationService: NavigationService,
        private authService: AuthService,
        private router: Router,
    ) {

        this.isOpen = this.navigationService.getIsOpen();

    }

    ngOnInit() {

    }

    public toggleSideNav() {
        this.navigationService.toggleIsOpen();
    }

    public getNavigationItems(): BehaviorSubject<NavRoute[]> {
        return this.navigationService.getNavigationItems();
    }

    public getActivePage(): Page {
        return this.navigationService.getActivePage();
    }

    public logout() {
        this.authService.logout();
        this.router.navigate(['login'], { replaceUrl: true });
    }

    public getPreviousUrl(): string[] {
        return this.navigationService.getPreviousUrl();
    }
}
