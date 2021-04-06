import { MaterialModule } from 'src/app/material-module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavMenuItemComponent } from './nav-menu-item.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { sideNavPath } from '../../../../nav-routing';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('NavMenuItemComponent', () => {
    let component: NavMenuItemComponent;
    let fixture: ComponentFixture<NavMenuItemComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NavMenuItemComponent],
            imports: [
                MatIconModule,
                MatExpansionModule,
                MaterialModule,
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    {
                        path: sideNavPath,
                        children: [],
                    },
                ]),
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavMenuItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
