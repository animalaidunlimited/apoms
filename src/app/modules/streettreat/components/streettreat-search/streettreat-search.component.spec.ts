import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreettreatSearchComponent } from './streettreat-search.component';

describe('StreettreatSearchComponent', () => {
  let component: StreettreatSearchComponent;
  let fixture: ComponentFixture<StreettreatSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreettreatSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StreettreatSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
