import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetTreatSearchComponent } from './streettreat-search.component';

describe('StreettreatSearchComponent', () => {
  let component: StreetTreatSearchComponent;
  let fixture: ComponentFixture<StreetTreatSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreetTreatSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetTreatSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
