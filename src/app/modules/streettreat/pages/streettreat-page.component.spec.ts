import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetTreatPageComponent } from './streettreat-page.component';

describe('StreettreatPageComponent', () => {
  let component: StreetTreatPageComponent;
  let fixture: ComponentFixture<StreetTreatPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreetTreatPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetTreatPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
