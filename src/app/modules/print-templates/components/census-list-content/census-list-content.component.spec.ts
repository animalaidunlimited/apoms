import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CensusListContentComponent } from './census-list-content.component';

describe('CensusListContentComponent', () => {
  let component: CensusListContentComponent;
  let fixture: ComponentFixture<CensusListContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CensusListContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusListContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
