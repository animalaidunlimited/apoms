import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RescueDetailsComponent } from './rescue-details.component';

describe('RescueDetailsComponent', () => {
  let component: RescueDetailsComponent;
  let fixture: ComponentFixture<RescueDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RescueDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RescueDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
