import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutstandingCaseBoardComponent } from './outstanding-case-board.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('OutstandingCaseBoardComponent', () => {
  let component: OutstandingCaseBoardComponent;
  let fixture: ComponentFixture<OutstandingCaseBoardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ OutstandingCaseBoardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutstandingCaseBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
