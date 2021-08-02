import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseLocationComponent } from './case-location.component';

describe('CaseLocationComponent', () => {
  let component: CaseLocationComponent;
  let fixture: ComponentFixture<CaseLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaseLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
