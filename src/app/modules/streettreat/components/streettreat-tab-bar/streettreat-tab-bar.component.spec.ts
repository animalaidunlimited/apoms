import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';

import { StreetTreatTabBarComponent } from './streettreat-tab-bar.component';

describe('StreettreatTabBarComponent', () => {
  let component: StreetTreatTabBarComponent;
  let fixture: ComponentFixture<StreetTreatTabBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[
        MaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [ StreetTreatTabBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetTreatTabBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
