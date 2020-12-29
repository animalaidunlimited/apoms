import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamRescueAssingerComponent } from './team-rescue-assinger.component';

describe('TeamRescueAssingerComponent', () => {
  let component: TeamRescueAssingerComponent;
  let fixture: ComponentFixture<TeamRescueAssingerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamRescueAssingerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamRescueAssingerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
