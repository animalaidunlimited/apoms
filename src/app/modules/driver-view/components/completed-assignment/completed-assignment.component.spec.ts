import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedAssignmentComponent } from './completed-assignment.component';

describe('CompletedAssignmentComponent', () => {
  let component: CompletedAssignmentComponent;
  let fixture: ComponentFixture<CompletedAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompletedAssignmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
