import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetTreatTabBarComponent } from './streettreat-tab-bar.component';

describe('StreettreatTabBarComponent', () => {
  let component: StreetTreatTabBarComponent;
  let fixture: ComponentFixture<StreetTreatTabBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
