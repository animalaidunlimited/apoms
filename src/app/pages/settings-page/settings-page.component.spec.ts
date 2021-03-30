import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';

import { SettingsPageComponent } from './settings-page.component';

describe('SettingsPageComponent', () => {
    let component: SettingsPageComponent;
    let fixture: ComponentFixture<SettingsPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule,
                BrowserAnimationsModule,
                MaterialModule ],
            declarations: [SettingsPageComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SettingsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
