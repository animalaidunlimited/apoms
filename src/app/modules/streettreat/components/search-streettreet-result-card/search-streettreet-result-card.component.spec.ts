import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchStreetTreetResultCardComponent } from './search-streettreet-result-card.component';

describe('SearchStreettreetResultCardComponent', () => {
  let component: SearchStreetTreetResultCardComponent;
  let fixture: ComponentFixture<SearchStreetTreetResultCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchStreetTreetResultCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchStreetTreetResultCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
