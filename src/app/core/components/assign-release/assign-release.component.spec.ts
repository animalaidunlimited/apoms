import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignReleaseComponent } from './assign-release.component';

describe('AssignReleaseComponent', () => {
  let component: AssignReleaseComponent;
  let fixture: ComponentFixture<AssignReleaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignReleaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
