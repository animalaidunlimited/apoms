import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavRoute, NavRouteService } from '../src/app/nav-routing';

export class Page {
    title: string;
    isChild: boolean;
    userHasPermission: boolean;
    constructor(title:string, isChild:boolean,userHasPermission:boolean) {
        this.title = title;
        this.isChild = isChild;
        this.userHasPermission = userHasPermission;
    }
}

@Injectable({
    providedIn: 'root',
})
export class NavigationService {

    navigationItems: BehaviorSubject<NavRoute[]>;
    private selectedNavigationItem: NavRoute | undefined = {} as NavRoute;
    private activePage: Page = new Page('', false,true);
    private navigationStack: Array<Array<string>> = [];

    public isOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(window.innerWidth < 840 ? false : true);
    public isSearchClicked: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private ngUnsubscribe = new Subject();

    constructor(private navRouteService: NavRouteService) {
        this.navigationItems = navRouteService.getNavRoutes();
    }

    public getNavigationItems(): BehaviorSubject<NavRoute[]> {
        return this.navigationItems;
    }

    public selectNavigationItemByPath(path: string) {
        // tslint:disable-next-line: deprecation
        this.navigationItems.pipe(takeUntil(this.ngUnsubscribe)).subscribe(nav=>
            this.selectedNavigationItem = nav
            .reduce((flatList:NavRoute[], navItem:NavRoute) => {
                if (navItem.groupedNavRoutes) {
                    navItem.groupedNavRoutes.forEach(route => {
                        flatList.push(route);
                    });
                } else {
                    flatList.push(navItem);
                }
                return flatList;
            }, [])
            .find((navItem:NavRoute) => navItem.path === path)
        );
    }

    public getSelectedNavigationItem(): NavRoute | undefined {
        return this.selectedNavigationItem;
    }

    public getActivePage(): Page {
        return this.activePage;
    }

    public resetStack(url: string[]) {
        this.navigationStack = [url];
    }

    public pushToStack(url: string[]) {
        this.navigationStack.push(url);
    }

    public popFromStack() {
        this.navigationStack.pop();
    }

    public getPreviousUrl(): string[] {
        return this.navigationStack
            .slice(0, -1)
            .reduce((flatUrl, urlSegment) => [...flatUrl, ...urlSegment], []);
    }

    public getCurrentUrl(): string[] {
        return this.navigationStack.reduce(
            (flatUrl, urlSegment) => [...flatUrl, ...urlSegment],
            [],
        );
    }

    public getIsOpen() : BehaviorSubject<boolean> {

        return this.isOpen;
    }

    public toggleIsOpen() {

        let haveRun = false;

        // tslint:disable-next-line: deprecation
        this.isOpen.pipe(takeUntil(this.ngUnsubscribe)).subscribe(currentValue => {

            if(haveRun){
                return;
            }
            else{

                haveRun = true;
                this.isOpen.next(!currentValue);
            }

        });

    }

    public closeIsOpen(){

        this.isOpen.next(false);

    }

    public setActivePage(
        title: string,
        url: string[],
        isChild: boolean = false,
        userHasPermission: boolean = false
    ) {

        if (url.length > 0 && userHasPermission) {
            isChild ? this.pushToStack(url) : this.resetStack(url);
        }
        this.activePage = new Page(title, isChild, userHasPermission);
    }

    public setActivePageTitle(title: string): void {

        this.activePage.title = title;

    }
}