import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutstandingCaseBoard2Component } from './outstanding-case-board2.component';

describe('OutstandingCaseBoard2Component', () => {
  let component: OutstandingCaseBoard2Component;
  let fixture: ComponentFixture<OutstandingCaseBoard2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutstandingCaseBoard2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutstandingCaseBoard2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
