import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutstandingCaseMapComponent } from './outstanding-case-map.component';

describe('OutstandingCaseMapComponent', () => {
  let component: OutstandingCaseMapComponent;
  let fixture: ComponentFixture<OutstandingCaseMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutstandingCaseMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutstandingCaseMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
