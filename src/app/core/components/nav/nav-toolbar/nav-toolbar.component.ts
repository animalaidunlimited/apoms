import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { UserAccountDetails, UserPreferences } from 'src/app/core/models/user';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { NavigationService, Page } from '../../../services/navigation/navigation.service';

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

    @ViewChild('preferencesDiv') preferencesDiv!: ElementRef;

    mobile = false;

    userDetails!: BehaviorSubject<UserAccountDetails>;

    userDetailsForm = this.fb.group({
        clearSearchOnTabReturn: false
    });

    showPreferences = false;

    constructor(
        private navigationService: NavigationService,
        private router: Router,
        private snackbar: SnackbarService,
        private userService: UserOptionsService,
        private renderer: Renderer2,
        private fb: FormBuilder) {}

    ngOnInit() {

        this.checkUrl();

        if (window.screen.width < 786) { // 768px portrait
            this.router.events
                .pipe(filter((event:any) => event instanceof NavigationEnd))
                .subscribe((val) => {
                    this.checkUrl();
                });
        }

        this.userDetails = this.userService.getUserAccountDetails();

        this.userDetails.subscribe(preferences => {
            this.userDetailsForm.patchValue(preferences.preferences, {emitEvent: false});
        });

        this.userDetailsForm.valueChanges.subscribe(preferences => {

            this.saveUserPreferences(preferences);
        });

        this.renderer.listen('window', 'click',(e:Event)=>{

            // Close the preferences div if clicking outside of it
            if(!this.preferencesDiv.nativeElement.contains(e.target) && this.showPreferences) {
              this.showPreferences = false;
            }

        });

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

    saveUserPreferences(preferences : UserPreferences) : void {

        this.userService.updateUserPreferences(preferences).then(result => {

            result.success === 1 ?
                this.snackbar.successSnackBar('User preferences updated successfully', 'OK')
                 :
                this.snackbar.errorSnackBar('Error updating user preferences', 'OK');

        })

    }
}
