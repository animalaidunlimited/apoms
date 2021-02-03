import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamVisitAssingerComponent } from './team-visit-assinger.component';

describe('TeamVisitAssingerComponent', () => {
  let component: TeamVisitAssingerComponent;
  let fixture: ComponentFixture<TeamVisitAssingerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamVisitAssingerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamVisitAssingerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
