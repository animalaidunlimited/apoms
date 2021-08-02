import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutstandingCaseBoardComponent } from './outstanding-case-board.component';

describe('OutstandingCaseBoardComponent', () => {
  let component: OutstandingCaseBoardComponent;
  let fixture: ComponentFixture<OutstandingCaseBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutstandingCaseBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutstandingCaseBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
