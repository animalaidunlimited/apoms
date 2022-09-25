import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationService, Page } from '../../../../../../navigation/navigation.service';

@Component({
    selector: 'app-nav-toolbar',
    templateUrl: './nav-toolbar.component.html',
    styleUrls: ['./nav-toolbar.component.scss'],
})
export class NavToolbarComponent implements OnInit {

    @Input() activePage!: Page;
    @Input() previousUrl!: string[];

    @Output() toggleSideNav = new EventEmitter();
    @Output() logout = new EventEmitter();   

    mobile = false;    

    constructor(
        private navigationService: NavigationService,
        private router: Router
        ) {}

    ngOnInit() {

        this.checkUrl();

        if (window.screen.width < 786) { // 768px portrait
            this.router.events
                .pipe(filter((event:any) => event instanceof NavigationEnd))
                .subscribe((val) => {
                    this.checkUrl();
                });
        }



    }

    checkUrl(){

        const urlParams = this.router.url.substring(this.router.url.lastIndexOf('/') + 1, this.router.url.length);

        this.mobile = urlParams === 'hospital-manager' || urlParams === 'emergency-register';

    }

    public onToggleSideNav() {
        this.toggleSideNav.emit();
    }

    public onLogout() {
        this.logout.emit();
    }

    onSetSearchFocus(){
        this.navigationService.isSearchClicked.next(true);
    }


}
